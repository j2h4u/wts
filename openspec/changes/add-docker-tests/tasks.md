# Tasks: add-docker-tests

## 1. Test Infrastructure

- [x] 1.1 Create `Dockerfile` (FROM oven/bun, install git & openssh-client)
- [x] 1.2 Create `test/e2e.ts` skeleton
- [x] 1.3 Add SSH setup in `test/run.sh` script (mount SSH_AUTH_SOCK)

## 2. Test Scenarios

- [x] 2.1 Implement `clone` test (clone j2h4u/wts)
- [x] 2.2 Implement `new` test (create feature/test)
- [x] 2.3 Implement `list` test (verify output)
- [x] 2.4 Implement `done` test (remove feature/test)

## 3. Automation

- [x] 3.1 verification: build docker image
- [x] 3.2 verification: run docker container with tests passing
