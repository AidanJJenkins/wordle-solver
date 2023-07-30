use actix_web::{web, HttpResponse};
use chrono::Local;
use sqlx::PgPool;
use log::error;
use crate::models::users_models::{NewUser, UserResponse, LoginCredentials, Token, Tokens, UpdateUser, UpdatePassword};
use crate::utils::bcrypt_utils::{hash_password, verify_password};
use crate::utils::jwt_utils::{generate_access_token, generate_refresh_token, verify_token, decode_token_id};

pub async fn create_user(
    pool: web::Data<PgPool>, 
    new_user: web::Json<NewUser>
) -> HttpResponse {
    let now = Local::now().naive_local();

    let hashed_password = match hash_password(&new_user.password) {
        Ok(hashed) => hashed,
        Err(error) => {
            error!("Failed to hash password: {}", error);
            return HttpResponse::InternalServerError().body("Failed to create user");
        }
    };

    match sqlx::query!(
            r#"
            INSERT INTO users (username, email, password, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            "#, 
            new_user.username, new_user.email, hashed_password, now, now,
            )
        .fetch_all(pool.get_ref())
        .await
        {
            Ok(row) => {
            if let Some(row) = row.first() {
                let user_id: i32 = row.id;

                let access_token = match generate_access_token(user_id) {
                    Ok(token) => token,
                    Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token"),
                };

                let new_refresh_token = match generate_refresh_token(user_id) {
                    Ok(token) => token,
                    Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token"),
                };

                let new_tokens = Tokens {
                    access: access_token,
                    refresh: new_refresh_token
                };

                let json_body = match serde_json::to_string(&new_tokens) {
                    Ok(body) => body,
                    Err(_) => return HttpResponse::InternalServerError().body("Failed to serialize response"),
                };

                HttpResponse::Ok().body(json_body)
            } else {
                    HttpResponse::InternalServerError().body("Failed to create user")
                }
            }

            Err(error) => {
                let error_message = error.to_string();
                if error_message.contains("duplicate key value violates unique constraint") {
                    println!("{}", error);
                    return HttpResponse::BadRequest().body("Username or Email already exists");
                }

                println!("{}", error);
                error!("Failed to insert new user: {}", error);
                HttpResponse::InternalServerError().body("Failed to create user")
            }
        }
}

async fn select_users(
    pool: &PgPool
) -> Result<Vec<UserResponse>, sqlx::Error> {
    let rows = sqlx::query_as!(
        UserResponse,
        "
        SELECT id, username, email, password, created_at, updated_at FROM users"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        log::error!("Failed to execute query: {:?}", e);
        e
    })?;
    Ok(rows)
}

pub async fn get_all_users(
    pool: web::Data<PgPool>
) -> HttpResponse {
    match select_users(&pool.clone()).await{
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => {
            log::error!("Failed to execute query: {:?}", e);
            HttpResponse::BadRequest().finish()
        }
    }
}

async fn select_user(
    pool: &PgPool,
    id: &i32
) -> Result<Vec<UserResponse>, sqlx::Error> {
    let rows = sqlx::query_as!(
        UserResponse,
        "
        SELECT id, username, email, password, created_at, updated_at FROM users WHERE id = $1",
        id
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        log::error!("Failed to execute query: {:?}", e);
        e
    })?;
    Ok(rows)
}

pub async fn get_user_by_id(
    pool: web::Data<PgPool>,
    path: web::Path<i32>
) -> HttpResponse {
    let id = path.into_inner();
    match select_user(&pool.clone(), &id).await{
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => {
            log::error!("Failed to execute query: {:?}", e);
            HttpResponse::BadRequest().finish()
        }
    }
}

pub async fn update_user(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    updated_user: web::Json<UpdateUser>
) -> HttpResponse {
    let id = path.into_inner();
    match sqlx::query!(
            r#"UPDATE users SET username = $1, email = $2 WHERE id = $3"#,updated_user.username, updated_user.email, id
    )
    .execute(pool.get_ref())
    .await
    {
        Ok(_) => HttpResponse::Ok().json("user updated succesfully"),
        Err(e) => {
            log::error!("Failed to execute query: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn update_password(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    updated_pw: web::Json<UpdatePassword>
) -> HttpResponse {
    let id = path.into_inner();
    let hashed_password = match hash_password(&updated_pw.password) {
        Ok(hashed) => hashed,
        Err(error) => {
            error!("Failed to hash password: {}", error);
            return HttpResponse::InternalServerError().body("Failed to create user");
        }
    };
    match sqlx::query!(
            r#"UPDATE users SET password = $1 WHERE id = $2"#, hashed_password, id
    )
    .execute(pool.get_ref())
    .await
    {
        Ok(_) => HttpResponse::Ok().json("password updated succesfully"),
        Err(e) => {
            log::error!("Failed to execute query: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn delete_user(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> HttpResponse {
    let id = path.into_inner();
    match sqlx::query!(
        r#"DELETE FROM users WHERE id = $1"#,
        id
    )
    .execute(pool.get_ref())
    .await
    {
        Ok(_) => HttpResponse::Ok().json("Account deleted successfully"),
        Err(e) => {
            log::error!("Failed to execute query: {:?}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

async fn validate_credentials(
    pool: &web::Data<PgPool>, 
    username: &str, password: &str
) -> Option<i32> {
    let query = sqlx::query!(
        r#"
        SELECT id, password FROM users WHERE username = $1
        "#,
        username
    )
    .fetch_optional(pool.get_ref())
    .await
    .expect("Failed to execute SQL query");

    if let Some(row) = query {
        let stored_password = row.password;

            if verify_password(password, &stored_password) {
                return Some(row.id);
            }
    }

    None
}

pub async fn login_user(
    pool: web::Data<PgPool>, 
    credentials: web::Json<LoginCredentials>
) -> HttpResponse {
    let user_id = match validate_credentials(&pool, &credentials.username, &credentials.password).await {
        Some(user_id) => user_id,
        None => return HttpResponse::Unauthorized().body("Invalid credentials"),
    };

    let access_token = match generate_access_token(user_id) {
        Ok(token) => token,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token"),
    };

    let new_refresh_token = match generate_refresh_token(user_id) {
        Ok(token) => token,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to generate token"),
    };

    let new_tokens = Tokens {
        access: access_token,
        refresh: new_refresh_token
    };

    let json_body = match serde_json::to_string(&new_tokens) {
        Ok(body) => body,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to serialize response"),
    };

    HttpResponse::Ok().body(json_body)
}

pub async fn revoke_token(
    pool: web::Data<PgPool>, 
    token: web::Json<Token>
) -> HttpResponse {
    let now = Local::now().naive_local();

    match sqlx::query!(
            r#"
            INSERT INTO revoked_tokens (token, created_at)
            VALUES ($1, $2)
            "#, token.token, now)
        .execute(pool.get_ref())
        .await {
            Ok(_) => HttpResponse::Ok().body("Token added"),
            Err(error) => {
                println!("erro: {}", error);
                error!("Failed to insert new token: {}", error);
                HttpResponse::InternalServerError().body("Failed to add token")
            }
        }
}

pub async fn refresh_tokens(
    token: web::Json<Token>, 
    pool: web::Data<PgPool>
) -> HttpResponse {
    let revoked_token = check_revoked_token(&token.token, &pool).await;

    if revoked_token {
        return HttpResponse::Unauthorized().body("Token has been revoked");
    }

    let token_valid = verify_token(&token.token).unwrap_or(false);

    if !token_valid {
        return HttpResponse::Unauthorized().body("Unauthorized");
    }

    let user_id = decode_token_id(&token.token);

    let access_token = match generate_refresh_token(user_id) {
        Ok(token) => token,
        Err(err) => {
            println!("Error generating refresh token: {}", err);
            return HttpResponse::InternalServerError().finish();
        }
    };

    let new_refresh_token = match generate_refresh_token(user_id) {
        Ok(token) => token,
        Err(err) => {
            println!("Error generating refresh token: {}", err);
            return HttpResponse::InternalServerError().finish();
        }
    };

    let new_tokens = Tokens {
        access: access_token,
        refresh: new_refresh_token
    };

    let json_body = match serde_json::to_string(&new_tokens) {
        Ok(body) => body,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to serialize response"),
    };

    HttpResponse::Ok().body(json_body)
}

async fn check_revoked_token(
    token: &str, 
    pool: &PgPool
) -> bool {
    let query = sqlx::query(
        r#"
        SELECT token FROM revoked_tokens WHERE token = $1
        "#,
    )
    .bind(token)
    .fetch_one(pool)
    .await;

    match query {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub async fn check_access(
    token: web::Json<Token>, 
    pool: web::Data<PgPool>
) -> HttpResponse {
    let revoked_token = check_revoked_token(&token.token, &pool).await;

    if revoked_token {
        return HttpResponse::Unauthorized().body("Token has been revoked");
    }

    let token_valid = verify_token(&token.token).unwrap_or(false);

    if !token_valid {
        return HttpResponse::Unauthorized().body("Unauthorized");
    }


    HttpResponse::Ok().body("access granted")
}
