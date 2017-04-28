module.exports.urlSchema = {
  ip: String,
  url: String,
  hash: String,
  created_at: Date,
  updated_at: Date
};

module.exports.userSchema = {
  email: String,
  name: String,
  facebookId: String,
  googleId: String,
  created_at: Date,
  picture: String
}