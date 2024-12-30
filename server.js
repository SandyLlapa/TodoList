import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

var app = express();
app.use(express.json());

var connection = mysql.createConnection({
  host: "cse-mysql-classes-01.cse.umn.edu",
  user: "C4131F24S002U30",
  password: "llapa016",
  database: "C4131F24S002U30",
  port: 3306
});

connection.connect(function(err) {
  if (err) {
    throw err;
  };
  console.log("Connected to MYSQL database!");
});

app.use(session({
  secret: 'csci4131secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', 'static/views');
app.set('view engine', 'pug');
app.use('/js',express.static('static/js'));
app.use('/css',express.static('static/css'));
app.use('/images', express.static('static/images'));

// server listens on port 4131 for incoming connections 
const port = 4131
app.listen(port, () => console.log('Listening on port: ' + port +'!'));


/////////////  GET ROUTES:  ///////////////

//BONUS : create account get route 
app.get('/create-account.html',function(req,res){
  if (req.session && req.session.loggedIn) {
    res.redirect('/mycontacts.html'); //if successful redirect to contacts page 
  } else {
    res.sendFile('create-account.html', { root: 'static/html' }); // if not try again
  }
});


// get route: sort contacts 
app.get('/sort-contacts',function(req,res){

  if(req.session && req.session.loggedIn){
    connection.query('SELECT * FROM contacts ORDER BY SUBSTRING_INDEX(name, " ", 1), SUBSTRING_INDEX(name, " ", -1)',(err,results)=>{
      if(err){
        console.error('Error in sorting: ',err);
        return res.status(500).send('Error in sorting');
      }
      res.json(results);
    });
  }
  else{
    res.redirect("/login.html");
  }
});

//get route: edit-contact
app.get('/edit-contact.html', function(req,res){
  if(req.session && req.session.loggedIn){
    res.sendFile('edit-contact.html',{root:'static/html'});
  }
  else{
    res.redirect("/login.html");
  }
});

//get route: edit-contact/id
app.get('/edit-contact/:id',function(req,res){

  if(req.session && req.session.loggedIn){ // if logged in.. 
    const contactId = req.params.id;
    connection.query('SELECT * FROM contacts WHERE id = ?',[contactId], function(err,result){
      if(err){
        console.error('Error in database: ',err);
        return res.status(500).send('Database error');
      }
      res.render('edit-contact',{contact:result[0]});
    });
  }
  else{
    res.redirect('/login.html');
  }
});


//get login.html route
app.get('/login.html',function(req,res){
  if (req.session && req.session.loggedIn) {
    res.redirect('/mycontacts.html');
  }
  else{
    res.sendFile('login.html',{root:'static/html'});
  }
});


// get route: contacts 
app.get('/mycontacts.html', function(req,res){ 
  if(req.session && req.session.loggedIn){ // if logged in, redirect to contacts page 
    res.sendFile('/mycontacts.html',{root:'static/html'});
  }
  else{
    res.redirect('/login.html');
  }
});

// get route: contactForm (add-contact)
app.get('/contactForm.html',function(req,res){
  if(req.session && req.session.loggedIn){
    res.sendFile('contactForm.html',{root:'static/html'});
  }
  else{
    res.redirect('/login.html');
  }
});


//get contacts route
app.get('/contacts', function(req,res){

  if(req.session && req.session.loggedIn){

    connection.query('SELECT * FROM contacts',function(err,rows){
      if (err) throw err;

      if(rows.length ==0){
        console.log("No entries in contacts table");
      }
      else{
        for(var i=0; i<rows.length; i++){
          console.log(rows[i].id + " " + rows[i].name + " " + rows[i].address + " " + rows[i].info + " "+rows[i].email + " "+rows[i].url);
        }
      }
      res.json(rows);
      console.log("\n" + JSON.stringify(rows));
    }); 
  }
  else{
    res.redirect('/login.html');
  }


});


// Get route: Log out 
app.get('/logout', function(req, res){

	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				console.error("Error in destroying session: ",err);
				return res.status(500).send('Error logging out');
			} 

      // Redirect to login page
      console.log("Session Destroyed");
      res.redirect('/login.html');
		});
	}
	else { 
		console.log("Not logged in, cannot destroy session");
    res.redirect('/login.html');
	}
});


///////////////// POST ROUTES ///////////////

// BONUS:  post route: create-account
app.post('/create-account',function(req,res){
  const SALT_ROUNDS_COUNT = 10;
  const username= req.body.username;
  const password= req.body.password;

  // hash password to store in database 
  const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS_COUNT);
  connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword],function(err,results){

    if(err){
      console.error('Error creating account: ',err);

      if(err.code== 'ER_DUP_ENTRY'){
        return res.status(409).send('Username already exists');
      }
      return res.status(500).send('Failed to create account');
    }

    // regenerate session
    req.session.regenerate((err)=>{
      if(err){
        console.error('Error in regenerating session');
        return res.status(500).send('Failed to regenerate session'); 
      }
      req.session.loggedIn=true;
      req.session.username=username;
      res.status(200).send('Successfully created account');
    });
   });
});


// post route: /edit-contact/:id
app.post('/edit-contact/:id',function(req,res){

  if(req.session && req.session.loggedIn){
    const contactId=req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const info = req.body.info;
    const url = req.body.url; 

    const update= { name, email, address, info, url };

    // update the contact 
    connection.query('UPDATE contacts SET ? WHERE id = ?',[update,contactId], function(err,result){
      if(err){
        console.error('Error in database: ',err);
        return res.status(500).send('Failed to update contact');
      }
      res.redirect('/mycontacts.html');
    });
  }
  else{
    res.redirect('/login.html');
  }

});



//post login route
app.post('/login',function(req,res){
  const username= req.body.username;
  const password= req.body.password;

  connection.query( 'SELECT password FROM users WHERE username = ?',[username],function(err,results){
      if(err){
        console.error("Error in database: ",err);
        return res.status(500).send('Error');
      }

      if(results.length==0){
        return res.status(401).send('Invalid username');
      }
      
      // check if password matches 
      const passwordDB =results[0].password;
      const passwordMatch = bcrypt.compareSync(password,passwordDB);

      if(!passwordMatch){
        console.log("PASSWORD DOES NOT MATCH");
        return res.status(401).send('Invalid password');
      }

      // regenerate session
      req.session.regenerate((err)=>{
        if(err){
          return res.status(401).send('Failed to regenerate session');
        }

        req.session.loggedIn=true;
        req.session.username=username;
        res.status(200).send('Login was successful');
      });
    }
  );
});



// post contact route 
app.post('/add-contact',function(req,res){


  if (req.session && req.session.loggedIn) {
    const postData =req.body;
    console.log(`Recieved Post data: ${postData} `);


    //format data
    var rowToBeInserted = {
      name: postData.name,
      address: postData.address,
      info: postData.info,
      email: postData.email,
      url: postData.url
    };

    connection.query('INSERT contacts SET ?',rowToBeInserted,function(err, result){
      if(err) {
        throw err;
      }

      else{
        console.log("Values inserted");
        res.redirect(302,'/mycontacts.html')
      }
    });
  }
  else{
    res.redirect('/login.html');
  }
});




// delete route
app.delete('/delete/:id', function(req,res){

  if(req.session && req.session.loggedIn){
    const contactId=req.params.id;

    connection.query('DELETE FROM contacts where id = ?',[contactId], function(err,result){
      if(err){
        throw err;
      }

      console.log(`contact deleted: ${contactId}`);
      res.status(200).send('Contact deleted');
    });
  }
  else{
    res.redirect('/login.html')
  }
});


