const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path')
const cors = require('cors')

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

  const getProperty = (nif) => {
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
        let properties=[]
        for (let i = 0; i < response.data.data.boards[0].items_page.items.length; i++) {
          let data = response.data.data.boards[0].items_page.items[i].column_values[0]['text'];
          if (data === nif) {
            let property = response.data.data.boards[0].items_page.items[i].column_values[2]['text'];
            properties.push(property)
          }
        }
        console.log('Monday.com API Response:', response.data);
        return properties
      })
      .catch((error) => {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error; // Re-throw the error to be caught by the outer catch block if needed
      });
  };

const app = express();
app.use(express.static(path.join(__dirname + "/public")))
const port = process.env.PORT || 5000; // You can change the port as needed
app.use(cors())
app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { idNumber } = req.body;
  sendMondayRequest(idNumber)
  .then((result) => {
      if (result===undefined){
        res.status(400).json({ error: 'Invalid ID number' });
      }
      else{
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
        res.json({'email':result['email'],'nif':result['nif'],'otp': otp });
    }
    console.log(result);
  })
  .catch((error) => {
    console.error('Error in main:', error);
  });
});
app.post('/property', (req, res) => {
  const { id } = req.body;
  console.log(req.body)
  getProperty(id)
  .then((result) => {res.json({property:result });
});
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
