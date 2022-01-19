var http = require('http');
var fs = require('fs');
var ph = require('path');
var mysql = require('mysql');
var formidable = require('formidable');
var links = [];


var mkLink = () => {
   var link = '/';
   var lett = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for(var i=0;i <= 12;i++){
      link += lett.charAt(Math.floor(Math.random() * lett.length))
   }
   return link;
}

var api = (rq,rs) => {
   var con = mysql.createConnection({
                          host: "localhost",
                          user: "root",
                          password: "",
                          database: "uploadDb"
                      });
                      con.connect((err) => {
                         if (err) {
                            throw err;
                         }else{
                            var sql = `SELECT * FROM uploads`;
                            con.query(sql,(err,rest,fields) => {
                               if(err){
                                  throw err;
                               }else{
                                  rest.forEach((row) => {
                                     if(rq.url == `/api/del/${row.id}` && rq.method == 'GET'){
                                        var con = mysql.createConnection({
                          host: "localhost",
                          user: "root",
                          password: "",
                          database: "uploadDb"
                      });
                      con.connect((err) => {
                         if (err) {
                            throw err;
                         }else{
                            var sql = `DELETE FROM uploads WHERE id = ${row.id}`;
                            con.query(sql,(err,reslt) => {
                               if(err){
                                  throw err
                               }else{
                                  fs.unlink(row.path,(err) => {
                                     if(err){
                                        throw err;
                                     }else{
                                        rs.end('removed')
                                     }
                                  })
                               }
                            })
                         }
                      })
                                     }
                                  })
                               
                               }
                            })
                         }
                      })
}

function routing(rq,rs){
   for(var i =0;i < links.length;i++){
      var it = links[i];
      if(rq.url === it.link){
         rs.writeHead(200,{'Content-Disposition': 'attachment'})
         if(it.extname == '.php' || it.extname == '.py' || it.extname == '.js' || it.extname == '.html' || it.extname == '.txt' || it.extname == '.md' || it.extname == '.rb' || it.extname == '.cs' || it.extname == '.pdf'){
            fs.readFile(it.path,'utf8',(err,data) => {
               if(err){
                  throw err;
               }else{
                  rs.end(data)
               }
            })
         }else{
            fs.readFile(it.path,'',(err,data) => {
               if(err){
                  throw err;
               }else{
                  rs.end(data)
               }
            })
         }
      }
   }
}

http.createServer((rq,rs) => {
var con = mysql.createConnection({
                          host: "localhost",
                          user: "root",
                          password: "",
                          database: "uploadDb"
                      });
                      con.connect((err) => {
                         if (err) {
                            throw err;
                         }else{
                            var sql = `SELECT * FROM uploads`;
                            con.query(sql,(err,rest,fields) => {
                               if(err){
                                  throw err;
                               }else{
                                  rest.forEach((link) => {
                                     links.push(link);
                                  })
                                  if(rq.url == '/api/uploads' && rq.method == 'GET'){
      rs.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
      rs.end(JSON.stringify(links));
   }
   api(rq,rs)
                               }
                            })
                         }
                      })
   if(rq.url === '/'){
      rq.setEncoding('utf8')
      fs.readFile('index.html','utf8',(err,data) => {
         if(err){
            throw err;
         }else{
            rs.writeHead(200, {'Content-Type': 'text/html'});
            rs.end(data);
         }
      })
   }else if(rq.url === '/uploading' && rq.method === 'POST'){
      const form = formidable({multiples:true});
      form.uploadDir="./tmp/";
      form.parse(rq,(err,fields,files) => {
         if(err){
           rs.end(err.toString());
         }else{
           var name = files.upload.originalFilename;
           var ext = ph.extname(name);
           var oldPath = files.upload.filepath
           var newPath = `./uploads/${name}`
           fs.exists(newPath,(resp) => {
              if(resp){
                 rs.end('existed')
              }else if(!resp){
                 fs.rename(oldPath,newPath,(err) => {
                    if (err){
                       throw err;
                    }else{
                       var link = mkLink()
                       var con = mysql.createConnection({
                          host: "localhost",
                          user: "root",
                          password: "",
                          database: "uploadDb"
                      });
                      con.connect((err) => {
                         if (err) {
                            throw err;
                         }else{
                            var sql = `INSERT INTO uploads(id,path,name,link,extname) VALUES(null,'${newPath}','${name}','${link+ext}','${ext}')`;
                            con.query(sql,(err,rest) => {
                               if(err){
                                  throw err;
                               }else{
                                  console.log('inserted')
                                  
                               }
                            })
                         }
                      })
                     
                      rs.end(`file uploaded \n the link is http:/127.0.0.1:3000${link+ext}`)
                    }
                 })
              }
           })
         }
      })
   }else if(rq.url == '/uploading' && rq.method == 'GET'){
      rs.writeHead(404,{'Content-Type':'text/html'})
      rs.end(`there isnt any file to upload please go to <a href="http://127.0.0.1:3000/">home</a> and upload a file`)
   }else if(rq.url == '/login' && rq.method == 'GET'){
      fs.readFile('login.html','utf8',(err,data) => {
         if(err){
            throw err;
         }else{
            rs.writeHead(200, {'Content-Type': 'text/html'});
            rs.end(data);
         }
      })
   }else if(rq.url == '/login' && rq.method == 'POST'){
      
   }
   routing(rq,rs)

}).listen(3000);
