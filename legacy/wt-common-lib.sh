#!/usr/bin/env bash
# Common functions for worktree management scripts
# Source this file from other scripts:
#   script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && echo "$PWD")"
#   source "$script_dir/wt-common-lib.sh"
#
# shellcheck disable=SC2034  # Variables are used by sourcing scripts

# --- Colors ---
declare -r RED='\033[0;31m'
declare -r GREEN='\033[0;32m'
declare -r YELLOW='\033[1;33m'
declare -r BLUE='\033[0;34m'
declare -r CYAN='\033[0;36m'
declare -r BOLD='\033[1m'
declare -r NC='\033[0m' # No Color

# --- Helpers ---
function log { echo -e "${BLUE}==>${NC} ${BOLD}$*${NC}"; }
function info { printf "    %-14s %s\n" "$1" "$2"; }
function debug { echo -e "    ${CYAN}$*${NC}"; }
function success { echo -e "${GREEN}✓${NC} $*"; }
function warn { echo -e "${YELLOW}WARNING:${NC} $*" >&2; }
function error { echo -e "${RED}ERROR:${NC} $*" >&2; exit 1; }

# Run command or print in dry-run mode
# Requires: is_dry_run variable to be set (0 or 1)
function run {
    # Variable is_dry_run is defined in the script sourcing this library
    # shellcheck disable=SC2154 # is_dry_run is defined in sourcing script
    if (( is_dry_run )); then
        echo -e "${YELLOW}[DRY-RUN]${NC} $*"
    else
        "$@"
    fi
}

# Convert absolute path to relative (from container)
# Usage: rel_path "/abs/path" "/container/path"
function rel_path {
    local -r abs_path="$1"
    local -r container="$2"
    echo "${abs_path#"$container"/}"
}

# Convert branch name to safe directory name
# Replaces / and : with __ (underscores)
# Usage: branch_to_dir "feat/my-feature" -> "feat__my-feature"
function branch_to_dir {
    local -r branch="$1"
    echo "$branch" | tr '/:' '__'
}

# --- Layout Detection ---

# Find container root by searching for .bare/ directory upward
# Usage: find_container_root "/some/path"
# Returns: absolute path to container or exits with 1
function find_container_root {
    # args
    local -r start_dir="$1"

    # vars
    local current

    # code
    current="$(cd "$start_dir" && echo "$PWD")"
    
    while [[ "$current" != "/" ]]; do
        if [[ -d "$current/.bare" ]]; then
            echo "$current"
            return 0
        fi
        current="$(dirname "$current")"
    done
    
    return 1
}

# Print error when container is not found
# Usage: print_container_not_found_error "/searched/path"
function print_container_not_found_error {
    # args
    local -r searched_from="$1"
    
    # code
    echo ""
    echo -e "${RED}ERROR: Could not find worktree container${NC}"
    echo ""
    echo "Searched for .bare/ directory starting from script location."
    echo ""
    echo "Expected layout:"
    echo "  repo.worktree/.bare/  ← bare repository"
    echo "  repo.worktree/main/   ← main worktree (scripts here)"
    echo "  repo.worktree/feat-*/ ← feature worktrees"
    echo ""
    echo -e "${YELLOW}Hint:${NC} Verify the repository uses git worktree layout."
}

# Print error when not running from main worktree
# Usage: print_wrong_worktree_error "current_name" "/path/to/main" "command args"
function print_wrong_worktree_error {
    # args
    local -r current_name="$1"
    local -r main_path="$2"
    local -r rerun_command="$3"
    
    # code
    echo ""
    echo -e "${RED}ERROR: Script must be run from 'main' worktree${NC}"
    echo ""
    info "Current:" "$current_name"
    info "Required:" "main"
    echo ""
    echo -e "${YELLOW}Hint:${NC} Run from main worktree:"
    echo "  cd ../main && $rerun_command"
}

# Detect and validate worktree layout
# Sets global variables:
#   - container_dir
#   - worktree_root
# Usage: detect_layout "/path/to/script" "command for re-run"
# Exits with 1 if not in main worktree
function detect_layout {
    # args
    local -r script_path="$1"
    local -r rerun_command="$2"
    
    # vars
    local worktree_name
    local main_worktree
    
    # code
    log "Detecting worktree layout..."
    
    # Find container by walking up from script location
    if container_dir="$(find_container_root "$script_path")"; then
        : ok
    else
        print_container_not_found_error "$script_path"
        exit 1
    fi
    
    # Determine which worktree we're in
    worktree_root="$(dirname "$script_path")"
    worktree_name="$(basename "$worktree_root")"
    main_worktree="$container_dir/main"
    
    # assert worktree is main
    if [[ "$worktree_name" == "main" ]]; then
        : ok
    else
        print_wrong_worktree_error "$worktree_name" "$main_worktree" "$rerun_command"
        exit 1
    fi
    
    success "Layout OK (running from main)"
}

# --- Library Guard ---
# Ensure this script is sourced, not executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    warn "This script is a library and should not be executed directly."
    warn "Usage: source $(basename "${BASH_SOURCE[0]}")"
    exit 1
fi
