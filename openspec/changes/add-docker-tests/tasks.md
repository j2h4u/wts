# Tasks: add-docker-tests

## 1. Test Infrastructure

- [ ] 1.1 Create `Dockerfile` (FROM oven/bun, install git & openssh-client)
- [ ] 1.2 Create `test/e2e.sh` skeleton
- [ ] 1.3 Add SSH setup in `test/run.sh` script (mount SSH_AUTH_SOCK)

## 2. Test Scenarios

- [ ] 2.1 Implement `clone` test (clone j2h4u/wts)
- [ ] 2.2 Implement `new` test (create feature/test)
- [ ] 2.3 Implement `list` test (verify output)
- [ ] 2.4 Implement `done` test (remove feature/test)

## 3. Automation

- [ ] 3.1 verification: build docker image
- [ ] 3.2 verification: run docker container with tests passing
