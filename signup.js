export function getUserFields(context, args) {
  const { username, email } = args;
  
  return {
    username,
    name: username,
    email: email || null
  };
}
