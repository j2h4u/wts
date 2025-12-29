#!/usr/bin/env bash
# Creates a new worktree for a feature/bugfix branch
# Usage: ./scripts/wt-new.sh [--dry-run] <branch-name> [worktree-dir]
#
# Expected layout:
#   repo.worktree/.bare/     — bare repository
#   repo.worktree/main/      — main branch worktree
#   repo.worktree/feature-*/ — feature worktrees
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
declare branch=""
declare target_dir=""
declare container_dir=""
declare worktree_root=""

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
                if [[ -z "$branch" ]]; then
                    branch="$1"
                elif [[ -z "$target_dir" ]]; then
                    target_dir="$1"
                else
                    error "Too many arguments"
                fi
                shift
                ;;
        esac
    done

    # assert branch is set
    if [[ -n "$branch" ]]; then
        : ok
    else
        error "Usage: $0 [--dry-run] <branch-name> [worktree-dir]"
    fi
}

function resolve_target_dir {
    # args
    local -r container_path="$1"
    local -r branch_name="$2"
    
    # code
    if [[ -z "$target_dir" ]]; then
        # Convert branch name to safe directory name
        target_dir="$container_path/$(branch_to_dir "$branch_name")"
    elif [[ ! "$target_dir" = /* ]]; then
        target_dir="$container_path/$target_dir"
    fi

    # assert target doesn't exist
    if [[ -d "$target_dir" ]]; then
        local -r rel_path="${target_dir#"$container_path"/}"
        error "Directory '$rel_path' already exists. Remove it first or use a different name."
    fi

    local -r rel_path="${target_dir#"$container_path"/}"
    log "Target: ${CYAN}$rel_path${NC} (branch: $branch_name)"
}

function update_main {
    # args
    local -r wt_root="$1"

    # code
    log "Updating main branch..."
    cd "$wt_root"
    run git pull --ff-only
}

function check_branch_exists {
    # args
    local -r wt_root="$1"
    local -r branch_name="$2"
    
    # code
    # Check if branch exists locally or on remote
    if git -C "$wt_root" show-ref --verify --quiet "refs/heads/$branch_name" 2>/dev/null; then
        error "Branch '$branch_name' already exists locally."
    fi
    
    if git -C "$wt_root" show-ref --verify --quiet "refs/remotes/origin/$branch_name" 2>/dev/null; then
        error "Branch '$branch_name' already exists on remote."
    fi
}

function create_worktree {
    # args
    local -r target_path="$1"
    local -r branch_name="$2"

    # code
    log "Creating worktree..."
    run git worktree add "$target_path" -b "$branch_name"
}

function install_dependencies {
    # args
    local -r target_path="$1"

    # code
    log "Installing dependencies..."
    if (( ! is_dry_run )); then
        cd "$target_path"
    fi
    run bun install --frozen-lockfile
}

function copy_env {
    # args
    local -r wt_root="$1"
    local -r target_path="$2"

    # code
    if [[ -f "$wt_root/.env.local" ]]; then
        log "Copying .env.local from main..."
        run cp --update=none "$wt_root/.env.local" "$target_path/.env.local"
    else
        warn "No .env.local found in main worktree. Create it manually."
    fi
}

function print_success {
    # args
    local -r container_path="$1"
    local -r target_path="$2"
    
    # vars
    local -r rel_path="${target_path#"$container_path"/}"

    # code
    echo ""
    success "Worktree created: $rel_path"
    echo ""
    echo "Next steps:"
    echo "  cd ../$rel_path"
    echo "  bun run dev"
}

# --- Main ---
main() {
    # code
    parse_args "$@"
    
    (( is_dry_run )) && log "DRY-RUN mode enabled (no changes will be made)"
    
    detect_layout "$script_dir" "./scripts/wt-new.sh $branch"
    # shellcheck disable=SC2154 # container_dir and worktree_root set by detect_layout
    
    resolve_target_dir "$container_dir" "$branch"
    update_main "$worktree_root"
    check_branch_exists "$worktree_root" "$branch"
    create_worktree "$target_dir" "$branch"
    install_dependencies "$target_dir"
    copy_env "$worktree_root" "$target_dir"
    print_success "$container_dir" "$target_dir"
}

main "$@"
