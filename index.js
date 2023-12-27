const { Music , Auth} = require('./functions');
const express = require('express');
const app = express();
var cors = require('cors');

require('dotenv').config();
const port = process.env['port'];

app.use( cors() );
app.use( express.json() );

app.post('/stream/:token', async (req, res) => {
    const { query } = req.body;
    let { url } = req.body;
    let token = req.params.token

    if (new Auth().check_token(token)) {
        let music = new Music()
    
        if (query) {
            await music.search_by_words(query);
        }
        else{
            music.url = url;
        }
    
        if (!music.validate_url()) {
            res.status(400).send('Invalid video URL');
            //return;
        }
        new Auth().count_requests(token);
        try {
            await music.request_stream();
            let stream = music.streamUrl;
            let info = music.info.videoDetails
            res.json({ stream,info });
        } catch (error) {
            res.status(500).send('Failed to get video info');
        }
    }
    else{
        res.status(401).send('Unauthorized!');
    }
});

app.post('/auth', async (req, res) => {
    const { name } = req.body;
    const { password } = req.body;

    if (name && password) {
        let auth = new Auth(name,password)
        if (!auth.user_exsists()) {
            auth.token = auth.generate_token()
            auth.save_to_file()
            token = auth.token;
            res.status(201).json({name,password,token});
        }
        else{
            if (auth.right_credentials()) {
                res.status(202).send(`Right Credentials your token was: ${auth.token}`)
            } else {
                res.status(409).send('User alredy exsists!')
            }
        }
    }
    else{
        res.status(400).send('Invalid request!')
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
