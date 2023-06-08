use std::env;
use jsonwebtoken::{encode, EncodingKey, Header, decode, DecodingKey, Validation, Algorithm};
use dotenv::dotenv;
use serde::{Serialize, Deserialize};
use chrono::{Local, NaiveDateTime};

// Struct representing the claims in the JWT token
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub user_id: i32,
    pub issued: NaiveDateTime,
}

// Function to generate a JWT token
pub fn generate_token(user_id: i32) -> Result<String, Box<dyn std::error::Error>> {
    // Load the environment variables
    dotenv().ok();

    // Retrieve the secret key from the environment
    let secret_key = env::var("SECRET_KEY")?;
    let _timestamp = Local::now().naive_local();

    // Create the claims for the token
    let claims = Claims {
         user_id,
        issued: _timestamp,
    };

    // Encode the claims into a JWT token
    let token = encode(
        //&Header::default(), // Use default header
        &Header::new(Algorithm::HS256), // Use default header
        &claims,
        &EncodingKey::from_secret(secret_key.as_ref()),
    )?;

    Ok(token)
}

pub fn verify_token(token: &str) -> Result<Claims, Box<dyn std::error::Error>> {
    // Load the environment variables
    dotenv().ok();

    // Retrieve the secret key from the environment
    let secret_key = env::var("SECRET_KEY")?;

    // Decode and verify the token
    let decoded_token = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default(),
    )?;

    // Extract the claims from the decoded token
    let claims = decoded_token.claims;

    Ok(claims)
}
