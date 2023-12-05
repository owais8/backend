const axios = require('axios');
const nodemailer = require('nodemailer');
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Replace 'YOUR_API_KEY' with your Monday.com API key
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMwMDE5MzU0NSwiYWFpIjoxMSwidWlkIjo1MjY3NTM0NCwiaWFkIjoiMjAyMy0xMi0wMlQyMjo1MzozMi4zMTlaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjAxMDcyMTcsInJnbiI6ImFwc2UyIn0.JGHvCw1wPjNN9Th85PBIa8nPc5obl4-Phmk74y0bjMU';
const API_URL = 'https://api.monday.com/v2';

const query = `
  query {
    me {
      name
    }
    boards(limit: 2) {
      items_page {
        cursor
        items {
          id
          name
          column_values {
            id
            text
            value

          }
        }
      }
    }
  }
`;

const sendMondayRequest = (nif) => {
    return axios.post(
      API_URL,
      { query },
      {
        headers: {
          Authorization: API_KEY,
          'Content-Type': 'application/json',
          'API-Version': '2023-10',
        },
      }
    )
      .then((response) => {
        for (let i = 0; i < response.data.data.boards[0].items_page.items.length; i++) {
          let data = response.data.data.boards[0].items_page.items[i].column_values[0]['text'];
          if (data === nif) {
            let email = response.data.data.boards[0].items_page.items[i].column_values[5]['text'];
            return { 'nif': nif, 'email': email };
          }
        }
        console.log('Monday.com API Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error to be caught by the outer catch block if needed
      });
  };
  
  // Example usage with .then()
  sendMondayRequest('9876')
    .then((result) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'owaisorakzai77@gmail.com',
                pass: 'kqqnarnrwowshmco'
              }
        });
        let otp=generateOTP()
        var mailOptions = {
            from: 'owaisorakzai77@gmail.com',
            to: result['email'],
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          }); 
      console.log(result);
    })
    .catch((error) => {
      console.error('Error in main:', error);
    });
  
