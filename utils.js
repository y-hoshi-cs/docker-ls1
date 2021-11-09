exports.formPost = (title, contents = []) => {
  const updatedAt = new Date().toISOString()
  const post = {
    title,
    updatedAt,
    contents
  }
  return post
}