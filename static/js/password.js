
//code from class example pw_check.html and its asscoiated js file 

function checkPassword() {
  const passwordInputElement = document.getElementById("passwordInput");
  const pword = passwordInputElement.value;

  let outputText;
  let bgColor = "pink"
  let pwscore = zxcvbnts.core.zxcvbn(pword).score;

  outputText = "To Be Determined," + " Score is: " + pwscore;
  
  if (pword.length === 0) {
      outputText = "Enter a password";
  } else {
  
    switch(pwscore){
      case 0:
        outputText = "Horrible password";
        bgColor="red";
        break;

      case 1:
        outputText = "Bad password";
        bgColor="orange";
        break;

      case 2:
        outputText = "Mediocre password";
        bgColor="yellow";
        break;

      case 3:
        outputText = "Good password";
        bgColor="lightblue";
        break;

      case 4:
        outputText = "Great password";
        bgColor="limegreen";
        break;

    }

  
}

// and return the results here:
  document.getElementById("passwordCheckerResult").textContent = outputText;
  passwordInputElement.style.backgroundColor = bgColor;
}