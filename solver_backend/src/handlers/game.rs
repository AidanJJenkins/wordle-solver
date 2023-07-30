use crate::models::game_models::RequestLetters;
use actix_web::{web, HttpResponse, HttpRequest};
use sqlx::PgPool;
use crate::utils::jwt_utils::verify_token;

pub fn get_bearer_token(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("Authorization")
        .and_then(|header| {
            let header_value = header.to_str().ok()?;
            if header_value.starts_with("Bearer ") {
                Some(header_value.trim_start_matches("Bearer ").to_string())
            } else {
                None
            }
        })
}

pub async fn find_letters(pool: web::Data<PgPool>, req: HttpRequest, letters: web::Json<RequestLetters>) -> HttpResponse {
    let access_token = get_bearer_token(&req);

    if access_token.is_none() {
        return HttpResponse::Unauthorized().body("Unauthorized");
    }

    let token_valid = verify_token(&access_token.unwrap()).unwrap_or(false);

    if !token_valid {
        return HttpResponse::Unauthorized().body("Unauthorized");
    }
    
    let mut correct_pattern = String::new();
    for letter in letters.correct.chars() {
        correct_pattern.push_str(&format!("(?=.*{})", letter));
    }

    let query = format!("SELECT word FROM word_list WHERE word ILIKE '{}' AND word ~* '{}' AND NOT (word ~* '.*[{}].*')", letters.exact, correct_pattern, letters.incorrect);

    let words = sqlx::query_scalar(&query).fetch_all(pool.get_ref()).await;
    let words: Vec<String> = match words {
        Ok(result) => result,
        Err(error) => {
            println!("error: {}", error);
            return HttpResponse::InternalServerError().finish();
        }
    };
    HttpResponse::Ok().json(words)
}
