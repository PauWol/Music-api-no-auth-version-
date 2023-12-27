const ytdl = require('ytdl-core');
var fs = require("fs");

class Music {
    constructor(url){
        this.url = url
    }
    async search_by_words(query){
        query = query.replace(/ /g, '+');
        let searchUrl = `https://www.youtube.com/results?search_query=${query}`;
        await fetch(searchUrl)
        .then(response => response.text())
        .then(html => {
            let pattern = /watch\?v=(\S{11})/g;
            let videoIds = html.match(pattern);
            this.url = `https://www.youtube.com/${videoIds[0]}`;
            //console.log(this.url);
        })
        .catch(error => {
            console.error(error);
        });
    }

    validate_url(){
        return ytdl.validateURL(this.url);
    }

    async request_stream(){
            this.info = await ytdl.getInfo(this.url);
            // Find the best audio format
            this.format = ytdl.chooseFormat(this.info.formats, { quality: 'highestaudio' });
            // Create a streamable URL from the format
            this.streamUrl = this.format.url;
    }
}

class Auth {

    constructor(name,password){
        this.name = name;
        this.password = password;
        this.token = undefined;
    }
    generate_token(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    user_exsists(){
        let contents = fs.readFileSync('./resources/auth.json');
        let users = JSON.parse(contents);
        for (const i in users.users) {
            if (Object.hasOwnProperty.call(users.users, i)) {
                const element = users.users[i];
                if (element.name == this.name) {
                    return true
                }
            }
        }
    }

    right_credentials(){
        let contents = fs.readFileSync('./resources/auth.json');
        let users = JSON.parse(contents);
        for (const i in users.users) {
            if (Object.hasOwnProperty.call(users.users, i)) {
                const element = users.users[i];
                if (element.name == this.name && element.password == this.password) {
                    this.token = element.token;
                    return true
                }
            }
        }
    }

    save_to_file(){
        let contents = fs.readFileSync("./resources/auth.json");
        let users = JSON.parse(contents);

        if (!this.user_exsists()) {
            users.users.push({
                name: this.name,
                password: this.password,
                token: this.token,
                totalRequests:0
              });
    
            let jsonString = JSON.stringify(users);
    
            fs.writeFile("./resources/auth.json", jsonString, function(err) {
                if (err) throw err;
                console.log("Data added to file");
              });
        }
    }

    check_token(token){
        let contents = fs.readFileSync("./resources/auth.json");
        let users = JSON.parse(contents);

        for (const i in users.users) {
            if (Object.hasOwnProperty.call(users.users, i)) {
                const element = users.users[i];
                if (element.token == token) {
                    return true
                }
            }
        }
    }

    count_requests(token){
        let contents = fs.readFileSync("./resources/auth.json");
        let users = JSON.parse(contents);

        for (const i in users.users) {
            if (Object.hasOwnProperty.call(users.users, i)) {
                const element = users.users[i];
                if (element.token == token) {
                    users.users[i].totalRequests = users.users[i].totalRequests + 1
                    let json = JSON.stringify(users);
                    fs.writeFile("./resources/auth.json", json, (err) => {
                        if (err) {
                        console.error(err);
                        }
                    }); 
                }
            }
        }
    }
}

module.exports = { Music , Auth };