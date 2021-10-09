require('dotenv/config')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const AWS = require('aws-sdk')
const { uuid } = require('uuidv4')
const { Pool } = require("pg");

const app = express()
const port = process.env.PORT || 4000

app.use(cors())

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
})

const credentials = {
  user: "postgres",
  host: "postgres-db",
  database: "attainu-test",
  password: "attainu",
  port: 5432,
};

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '')
  },
})

const upload = multer({ storage }).single('file')

app.post('/upload', upload, (req, res) => {
  let myFile = req.file.originalname.split('.')
  const fileType = myFile[myFile.length - 1]
  console.log(fileType)
  console.log(req.file)
  if (req.file.size > 50000000) {
    res.status(400).json({ message: 'Video can upload upto 50mb only' })
  } else if (fileType !== 'mp4') {
    res.status(400).json({ message: 'You can upload videos only' })
  } else {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}.${fileType}`,
      Body: req.file.buffer,
    }
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err)
        res.status(500).send(err)
      }
      console.log(data)
      insertLink(data.Location)
      res.status(200).send(data)
    })
  }
})

app.get("/link",async (req,res)=>{
  let linkobj = await getLinksFromDb();
  res.status(200).json(linkobj);
})

async function createTableIfNotExists() {
  const pool = new Pool(credentials);
  const now = await pool.query("CREATE TABLE IF NOT EXISTS video_links (id SERIAL PRIMARY KEY,link text)");
  await pool.end();

  // console.log(now);
}

createTableIfNotExists()

async function insertLink(link) {
  const text = `
    INSERT INTO video_links (link)
    VALUES ($1)
  `;
  const values = []
  values.push(link)
  console.log(values)
  const pool = new Pool(credentials);
  const id = await pool.query(text, values);
  await pool.end();

  // console.log(id);
  getLinksFromDb()
}

async function getLinksFromDb() {
  const pool = new Pool(credentials);
  const links = await pool.query("SELECT * from video_links");
  await pool.end();
  console.log(links.rows)
  return links.rows
}

app.listen(port, () => {
  console.log(`server is up at ${port}`)
})
