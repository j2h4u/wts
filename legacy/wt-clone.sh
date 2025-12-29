#!/usr/bin/env bash
# Clones a repository into the "bare + worktrees" layout
# Usage: ./scripts/wt-clone.sh [--dry-run] <repo-url> [directory-name]
#
# Creates:
#   directory-name/
#   ├── .bare/           (bare repository)
#   └── main/            (main branch worktree)
#
set -euo pipefail

# --- Source common library ---
declare script_dir
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && echo "$PWD")"
declare -r script_dir

# shellcheck source=scripts/wt-common-lib.sh
source "$script_dir/wt-common-lib.sh" || { echo "Error: Library '$script_dir/wt-common-lib.sh' not found" >&2; exit 1; }

# --- Configuration ---
declare -i is_dry_run=0
declare repo_url=""
declare target_dir=""

# --- Functions ---
function parse_args {
    # code
    while (( $# > 0 )); do
        case "$1" in
            --dry-run|-n)
                is_dry_run=1
                shift
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                if [[ -z "$repo_url" ]]; then
                    repo_url="$1"
                elif [[ -z "$target_dir" ]]; then
                    target_dir="$1"
                else
                    error "Too many arguments"
                fi
                shift
                ;;
        esac
    done

    # assert repo_url is set
    if [[ -n "$repo_url" ]]; then
        : ok
    else
        error "Usage: $0 [--dry-run] <repo-url> [directory-name]"
    fi
}

function resolve_names {
    # vars
    local repo_name
    local fallback_name

    # code
    if [[ -z "$target_dir" ]]; then
        # Parse repository name from URL using regex
        # Supports:
        #   git@github.com:user/repo.git
        #   https://github.com/user/repo.git
        #   /path/to/repo.git
        if [[ "$repo_url" =~ /([^/]+)(\.git)?$ ]]; then
            repo_name="${BASH_REMATCH[1]}"
            repo_name="${repo_name%.git}"
            target_dir="${repo_name}.worktree"
        else
            # Fallback for weird URLs
            fallback_name=$(basename "$repo_url" .git)
            target_dir="${fallback_name}.worktree"
        fi
    fi
    
    log "Repository: ${CYAN}$repo_url${NC}"
    log "Container:  ${CYAN}$target_dir${NC}"
}

function setup_container {
    # code
    # assert target_dir doesn't exist
    if [[ ! -d "$target_dir" ]]; then
        : ok
    else
        error "Directory '$target_dir' already exists."
    fi
    
    log "Creating container directory..."
    run mkdir -p "$target_dir"
}

function clone_bare {
    # code
    log "Cloning bare repository..."
    run git clone --bare "$repo_url" "$target_dir/.bare"
}

function configure_git {
    # code
    log "Configuring git fetch refs..."
    if (( ! is_dry_run )); then
        cd "$target_dir/.bare"
        # Ensure we fetch all remote heads, not just the one we cloned
        git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
    else
        echo -e "${YELLOW}[DRY-RUN]${NC} cd $target_dir/.bare"
        echo -e "${YELLOW}[DRY-RUN]${NC} git config remote.origin.fetch \"+refs/heads/*:refs/remotes/origin/*\""
    fi
}

function create_main_worktree {
    # vars
    local default_branch
    local ls_remote_output

    # code
    log "Creating 'main' worktree..."
    if (( ! is_dry_run )); then
        # We are inside .bare directory
        # Query remote for default branch (refs/remotes/origin/HEAD doesn't exist after bare clone)
        ls_remote_output=$(git ls-remote --symref origin HEAD 2>/dev/null | head -1)
        
        if [[ "$ls_remote_output" =~ refs/heads/([^[:space:]]+) ]]; then
            default_branch="${BASH_REMATCH[1]}"
        else
            # Fallback: try 'main', then 'master'
            if git show-ref --verify --quiet "refs/heads/main"; then
                default_branch="main"
            elif git show-ref --verify --quiet "refs/heads/master"; then
                default_branch="master"
            else
                error "Could not determine default branch"
            fi
        fi
        
        debug "Default branch: $default_branch"
        
        git worktree add "../$default_branch" "$default_branch"
    else
        echo -e "${YELLOW}[DRY-RUN]${NC} git worktree add ../main <default-branch>"
    fi
}

function print_success {
    # code
    echo ""
    success "Repository cloned: $target_dir"
    echo ""
    echo "Next steps:"
    echo "  1. cd $target_dir/main"
    echo "  2. cp .env.local.example .env.local  # then edit with your secrets"
    echo "  3. bun install"
    echo "  4. bun run dev"
}

# --- Main ---
function main {
    # code
    parse_args "$@"
    
    (( is_dry_run )) && log "DRY-RUN mode enabled (no changes will be made)"
    
    resolve_names
    setup_container
    clone_bare
    configure_git
    create_main_worktree
    print_success
}

main "$@"
