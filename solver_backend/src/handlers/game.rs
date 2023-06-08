use crate::models::game_models::RequestLetters;
use crate::AppState;
use actix_web::{post, web, HttpResponse};

pub fn game_routes(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/game")
        .service(find_letters);

    conf.service(scope);
}

#[post("/general-letters")]
pub async fn find_letters(pool: web::Data<AppState>, letters: web::Json<RequestLetters>) -> HttpResponse {
    let mut correct_pattern = String::new();
    for letter in letters.correct.chars() {
        correct_pattern.push_str(&format!("(?=.*{})", letter));
    }

    let query = format!("SELECT word FROM word_list WHERE word ILIKE '{}' AND word ~* '{}' AND NOT (word ~* '.*[{}].*')", letters.exact, correct_pattern, letters.incorrect);

    let words = sqlx::query_scalar(&query).fetch_all(&pool.db).await;
    let words: Vec<String> = match words {
        Ok(result) => result,
        Err(error) => {
            println!("error: {}", error);
            return HttpResponse::InternalServerError().finish();
        }
    };
    HttpResponse::Ok().json(words)
}
