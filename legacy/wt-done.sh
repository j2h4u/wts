#!/usr/bin/env bash
# Removes a worktree after PR is merged
# Usage: ./scripts/wt-done.sh [--dry-run] <worktree-dir>
#
# Checks .env.local for unsaved changes before removal.
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
                if [[ -z "$target_dir" ]]; then
                    target_dir="$1"
                else
                    error "Too many arguments"
                fi
                shift
                ;;
        esac
    done

    # assert target_dir is set
    if [[ -n "$target_dir" ]]; then
        : ok
    else
        error "Usage: $0 [--dry-run] <worktree-dir>"
    fi
}

function resolve_target_dir {
    # args
    local -r container_path="$1"
    # Modifies global target_dir, this is arguably a side effect but necessary unless we use output capturing

    # code
    # Resolve to absolute path if relative
    if [[ ! "$target_dir" = /* ]]; then
        target_dir="$container_path/$target_dir"
    fi

    # assert target_dir exists
    if [[ -d "$target_dir" ]]; then
        : ok
    else
        local -r rel_target="${target_dir#"$container_path"/}"
        echo ""
        echo -e "${RED}ERROR: Worktree not found${NC}"
        echo ""
        info "Target:" "$rel_target"
        echo ""
        echo -e "${YELLOW}Hint:${NC} List available worktrees:"
        echo "  git worktree list"
        exit 1
    fi

    # assert target_dir is NOT main
    if [[ "$(basename "$target_dir")" != "main" ]]; then
        : ok
    else
        echo ""
        echo -e "${RED}ERROR: Cannot remove 'main' worktree!${NC}"
        exit 1
    fi

    local -r rel_target="${target_dir#"$container_path"/}"
    log "Target: ${CYAN}$rel_target${NC}"
}

function check_uncommitted_changes {
    # args
    local -r target_path="$1"
    
    # vars
    local status
    
    # code
    log "Checking for uncommitted changes..."
    status=$(git -C "$target_path" status --porcelain 2>/dev/null)
    
    if [[ -n "$status" ]]; then
        warn "Uncommitted changes detected!"
        echo ""
        git -C "$target_path" status --short
        echo ""
        if (( ! is_dry_run )); then
            read -r -p "Continue with removal? Changes will be LOST. [y/N] " response
            [[ "$response" =~ ^[Yy]$ ]] || exit 1
        fi
    else
        debug "Working tree clean ✓"
    fi
}

function check_env_diff {
    # args
    local -r wt_root="$1"
    local -r target_path="$2"

    # vars
    local main_env
    local target_env_file

    # code
    log "Checking .env.local..."
    
    main_env="$wt_root/.env.local"
    target_env_file="$target_path/.env.local"

    if [[ -f "$target_env_file" && -f "$main_env" ]]; then
        if ! diff -q "$main_env" "$target_env_file" > /dev/null 2>&1; then
            warn ".env.local differs from main!"
            echo ""
            diff "$main_env" "$target_env_file" || true
            echo ""
            if (( ! is_dry_run )); then
                read -r -p "Continue with removal? Changes will be LOST. [y/N] " response
                [[ "$response" =~ ^[Yy]$ ]] || exit 1
            fi
        else
            debug "Matches main ✓"
        fi
    elif [[ -f "$target_env_file" ]]; then
        warn ".env.local exists in worktree but not in main!"
        if (( ! is_dry_run )); then
            read -r -p "Continue with removal? [y/N] " response
            [[ "$response" =~ ^[Yy]$ ]] || exit 1
        fi
    else
        debug "No .env.local in target"
    fi
}

function remove_worktree {
    # args
    local -r wt_root="$1"
    local -r target_path="$2"

    # code
    log "Removing worktree..."
    cd "$wt_root"
    run git worktree remove "$target_path"
}

function get_worktree_branch {
    # args
    local -r wt_root="$1"
    local -r target_path="$2"
    
    # code
    # Parse: /path/to/worktree  abc1234 [branch-name]
    git -C "$wt_root" worktree list | grep "^$target_path " | sed 's/.*\[\(.*\)\]/\1/'
}

function delete_local_branch {
    # args
    local -r wt_root="$1"
    local -r branch_name="$2"
    
    # code
    if [[ -n "$branch_name" && "$branch_name" != "main" ]]; then
        log "Deleting local branch: ${CYAN}$branch_name${NC}"
        run git -C "$wt_root" branch -D "$branch_name"
    else
        debug "No branch to delete"
    fi
}

function print_success {
    # code
    echo ""
    success "Worktree and branch removed"
}

# --- Main ---
function main {
    # code
    parse_args "$@"
    
    (( is_dry_run )) && log "DRY-RUN mode (no changes)"
    
    detect_layout "$script_dir" "./scripts/wt-done.sh $target_dir"
    # shellcheck disable=SC2154 # container_dir and worktree_root set by detect_layout
    
    resolve_target_dir "$container_dir"
    check_uncommitted_changes "$target_dir"
    check_env_diff "$worktree_root" "$target_dir"
    
    # Get branch name BEFORE removing worktree (from git worktree list)
    local -r branch_name="$(get_worktree_branch "$worktree_root" "$target_dir")"
    
    remove_worktree "$worktree_root" "$target_dir"
    delete_local_branch "$worktree_root" "$branch_name"
    
    # Prune stale remote-tracking branches and update main
    log "Syncing with remote..."
    run git -C "$worktree_root" fetch --prune
    run git -C "$worktree_root" pull --ff-only
    
    # Ensure dependencies are up-to-date (merged branch may have added packages)
    log "Syncing dependencies..."
    run bun install --frozen-lockfile
    
    print_success
}

main "$@"
