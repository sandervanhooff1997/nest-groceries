# AGENTS

## Coding preferences

- Prefer initializing class properties via constructor parameter properties, e.g.
  `constructor(public readonly repo: Repo) {}`.
- Avoid declaring a class property and then assigning it inside the constructor when parameter properties can express
  the same intent.
- Apply this preference consistently in NestJS dependency injection and similar constructor-based patterns.
- Write clean code, prevent using comments as much as possible
- Use descriptive variable and method names to enhance code readability and maintainability.
- Seperate concerns by organizing code into modules, classes, and functions that have clear responsibilities.
- Create enums for fixed sets of related constants to improve code clarity and reduce errors.
- When creating file

### Preferred pattern

Use:

- `constructor(public readonly user: User) {}`

Instead of:

- declaring `user: User;` on the class and assigning `this.user = user` inside the constructor.

