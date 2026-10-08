# Entity relationship diagram

```mermaid
erDiagram
  USER ||--o{ PROJECT : owns
  USER ||--o{ REVOKED_TOKEN : revokes
  PROJECT ||--o{ TASK : contains

  USER {
    char36 id PK
    string fullName
    string email UK
    string passwordHash
    datetime createdAt
    datetime updatedAt
  }

  PROJECT {
    char36 id PK
    char36 ownerId FK
    string name
    string description
    enum status
    datetime startDate
    datetime endDate
    datetime createdAt
    datetime updatedAt
  }

  TASK {
    char36 id PK
    char36 projectId FK
    string name
    string description
    enum priority
    enum status
    datetime dueDate
    datetime createdAt
    datetime updatedAt
  }

  REVOKED_TOKEN {
    char36 id PK
    string jti UK
    char36 userId FK
    datetime expiresAt
    datetime createdAt
  }
```

Task ownership is derived through its project, so every task authorization
query is scoped through `Task.projectId -> Project.ownerId -> User.id`.
Projects cascade task deletion. Revoked tokens are retained only until their
JWT expiry.
