# Tasks: add-custom-hooks

## 1. Hook Logic

- [ ] 1.1 Implement `findHooksDir()` helper (in `.wts/hooks` or `.git/wts-hooks`?) -> Use `.wts/hooks` in worktree home.
- [ ] 1.2 Implement `runHook(hookName, env)` helper
- [ ] 1.3 Validate hook is executable

## 2. Integration

- [ ] 2.1 Add `post-clone` hook trigger to `cmdClone`
- [ ] 2.2 Add `post-new` hook trigger to `cmdNew`
- [ ] 2.3 Add `pre-done` hook trigger to `cmdDone`

## 3. Verification

- [ ] 3.1 Create `.wts/hooks/post-new` that echoes "Hook ran"
- [ ] 3.2 Run `wts new` and verify hook output
