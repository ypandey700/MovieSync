export const generateOtp = () => {
    console.log("inside otp gnerateor "); 
    const nums = "0123456789"; 
    const len = nums.length; 

    let otp = ""
    
    for(let i=0; i<6; i++ ){
        const randomIdx = Math.floor(Math.random()*len);
        otp+= nums[randomIdx]; 
    }
    
    return otp; 
}