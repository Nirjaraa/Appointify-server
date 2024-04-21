export const signup = (req,res) => 
{
    res.send("SignUp User");
    console.log("SignUp User");
}

//anonymous function is assinged to a variable


export const login = (req,res) =>
{
    res.send("login User");
    console.log("login User");
}


export const logout = (req,res) =>
{
    res.send("logout User");
    console.log("logout User");
}