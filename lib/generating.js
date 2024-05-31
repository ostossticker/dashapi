// Function to generate a random string
export const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
};

// Example usage
const email = ''; // Assuming email is empty
const length = 10; // Length of the random string
const randomEmail = email ? email : generateRandomString(length);

// Create a new user record with the randomEmail
