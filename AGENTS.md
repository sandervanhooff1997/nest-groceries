# AGENTS

## Coding preferences

- Prefer initializing class properties via constructor parameter properties, e.g.
  `constructor(public readonly repo: Repo) {}`.
- Avoid declaring a class property and then assigning it inside the constructor when parameter properties can express
  the same intent.
- Apply this preference consistently in NestJS dependency injection and similar constructor-based patterns.
- Write clean code, prevent using comments as much as possible
- Use descriptive variable and method names to enhance code readability and maintainability.

### Preferred pattern

Use:

- `constructor(public readonly user: User) {}`

Instead of:

- declaring `user: User;` on the class and assigning `this.user = user` inside the constructor.

