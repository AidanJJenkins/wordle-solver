use std::env;
use jsonwebtoken::{encode, EncodingKey, Header, decode, DecodingKey, Validation, Algorithm};
use dotenv::dotenv;
use chrono::{Local, Utc, Duration};
use crate::models::users_models::AccessClaims;


pub fn generate_token(user_id: i32, expiration_duration: Duration) -> Result<String, Box<dyn std::error::Error>> {
    dotenv().ok();

    let secret_key = env::var("SECRET_KEY")?;
    let issued_timestamp = Local::now().naive_local();

    let now = Utc::now();
    let expiration = now + expiration_duration;

    let claims = AccessClaims {
        user_id,
        issued: issued_timestamp,
        exp: expiration.timestamp() as usize,
    };

    let token = encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(secret_key.as_ref()),
    )?;

    Ok(token)
}

pub fn generate_access_token(user_id: i32) -> Result<String, Box<dyn std::error::Error>> {
    let exp_duration = Duration::minutes(60);

    let access_token = match generate_token(user_id, exp_duration){
        Ok(token) => token,
        Err(error) => {
            println!("erro: {}", error);
            return Err(error.into());
        }
    };

    Ok(access_token)
}

pub fn generate_refresh_token(user_id: i32) -> Result<String, Box<dyn std::error::Error>> {
    let exp_duration = Duration::days(7);

    let refresh_token = match generate_token(user_id, exp_duration){
        Ok(token) => token,
        Err(error) => {
            println!("erro: {}", error);
            return Err(error.into());
        }
    };

    Ok(refresh_token)
}


pub fn verify_token(token: &str) -> Result<bool, Box<dyn std::error::Error>> {
    dotenv().ok();

    let secret_key = env::var("SECRET_KEY")?;
    let current_time = Utc::now().timestamp();

    match decode::<AccessClaims>(
        &token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default(),
    ) {
        Ok(token) => {
            let expiration_time = token.claims.exp;
            if expiration_time > current_time as usize {
                Ok(true) // Refresh token is valid and not expired
            } else {
                Ok(false) // Refresh token is expired
            }
        }
        Err(error) => {
            println!("{}", error);
            Ok(false)
        }, // Refresh token is invalid
    }
}

pub fn decode_token_id(token: &str) -> i32 {
    dotenv().ok();

    let secret_key = env::var("SECRET_KEY").expect("Failed to get secret key");

    let decoded = decode::<AccessClaims>(
        &token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default(),
    )
    .expect("Failed to decode token");

    decoded.claims.user_id
}

