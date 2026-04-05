# BlogApp

A full-stack blog application built with Spring Boot and React. Users can register, log in, create articles, edit and delete their own articles, and comment on others.

---

## Tech Stack

**Backend**
- Java 17 + Spring Boot 3
- Spring Security + JWT authentication
- Spring Data JPA + Hibernate
- PostgreSQL

**Frontend**
- React 18 + Vite
- React Router DOM
- Axios

---

## Features

- JWT-based register and login
- Create, read, edit, delete blog articles
- Ownership enforcement — only the author can edit or delete their article
- Comments with author attribution
- Pagination on the article list
- Responsive navbar with auth state
- Consistent design system across all pages

---

## Project Structure

```
blogapp/
├── backend/                  # Spring Boot project
│   ├── src/main/java/com/yellocode/some/
│   │   ├── config/           # CORS and Security config
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Data transfer objects
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # JWT filter and utility
│   │   └── service/          # Business logic
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                 # React + Vite project
    ├── src/
    │   ├── api.js            # Axios instance and API calls
    │   ├── components/       # ArticleCard, ArticleForm, AppNavbar
    │   └── pages/            # Home, ArticleDetails, Login, Register
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL running locally

### Backend Setup

1. Clone the repo and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE blogapp;
   ```

3. Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/blogapp
   spring.datasource.username=your_pg_username
   spring.datasource.password=your_pg_password
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
   jwt.secret=your-very-long-random-secret-minimum-64-characters-for-hs512
   ```

4. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend starts on `http://localhost:8080`.

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

   The frontend starts on `http://localhost:5173`.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles?page=0&size=5` | Get paginated articles |
| GET | `/api/articles/{id}` | Get a single article |
| POST | `/api/articles` | Create an article (auth required) |
| PUT | `/api/articles/{id}` | Update an article (owner only) |
| DELETE | `/api/articles/{id}` | Delete an article (owner only) |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/{articleId}` | Get comments for an article |
| POST | `/api/comments/{articleId}` | Add a comment (auth required) |

---

## Environment Variables

Never commit secrets. Use environment variables or Spring profiles for production.

**Backend (`application.properties`)**
```properties
jwt.secret=        # Min 64 chars for HS512
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=
```

---

## License

MIT — see [LICENSE](LICENSE)
