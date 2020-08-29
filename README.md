# Installation

Open terminal (or Git Bash/PowerShell) in a location that you want to place the repository in.
Then type:
```
git clone https://github.com/tgargula/HomePage
```
You can list available versions by typing:
```
git tag -l
```
If you want to use the older version, type:
```
git checkout tags/<tag_name>
```

It is necessary to start a localhost server. There is a description below, how to do this, using Python *http.server* module.

### On Windows:
You have to have Python 3.* installed. In order to check that, you can type:
```
python -V
```
If an error occurs, then you will have to download the latest version from https://www.python.org.
Be sure to select: "Add Python to PATH".

Then type:
```
cd <your-repository-location>
python -m http.server 8000
```
This will run localhost server on port 8000. To access the page, visit: [localhost:8000](http://localhost:8000)

### On Linux/MacOS:

Install python3 from your package manager if it is not installed and type:
```
cd <your-repository-location>
python3 -m http.server 8000 &
```
This will run localhost server on port 8000. To access the page, visit: [localhost:8000](http://localhost:8000)

You can run localhost server every startup by adding these lines above to ~/.bash_profile or ~/.profile.

# Description

#### Default screen
<kbd>&#8592;</kbd> – previous page\
<kbd>&#8594;</kbd> – next page\
<kbd>&#8593;</kbd> – focus on search bar\
<kbd>&#8595;</kbd> – no more focus on search bar\
<kbd>Enter</kbd> – open Google (if search bar is active)\
Typing any letter will autofocus on search bar

#### Searching screen
<kbd>&#8592;</kbd> – previous tile\
<kbd>&#8594;</kbd> – next tile\
<kbd>Esc</kbd> – go back to default screen and clear input\
<kbd>Enter</kbd> – use selected tile or search using Google