use bcrypt::{hash, verify, DEFAULT_COST};

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    // Hash the password using bcrypt with a default cost factor
    hash(password, DEFAULT_COST)
}

pub fn verify_password(password: &str, hashed_password: &str) -> bool {
    //Verify the password against the hashed password
    match verify(password, hashed_password) {
        Ok(result) => result,
        Err(_) => false,
    }
}
