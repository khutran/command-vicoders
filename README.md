# Vicoders CLI

Vicoders CLI is a command line tool that can help you create some incredible things :)

## Table of Contents

- <a href="#installation">Installation</a>
- <a href="#commands">Commands</a>

## Installation

### NPM

Execute the following command to get the latest version of the package:

```terminal
npm install -g @vicoders/cli
```

If Yarn

```terminal
yarn global add @vicoders/cli
```

## Commands

For the list of all availabel commands, run following command
```
vcc --help
```

#### Create Project

```
vcc create-project --name="Project Name"
```

#### Install Servcice / Editor Extensition

```
vcc install
```

#### Git

> Move to your git repository then type the following command

```
vcc git
```

#### PWD

Print current working directory and copy it to clipboard

```
vcc pwd
```

#### Save settings on local

Save your settings on local, if settings found on local you can select "N" to use existing one or "Y" to override it

```
vcc init
```

Now you can use some command

Save current working directory to project list

```
vcc project .
```

List all saved project

```
vcc project list
```

Open project with given id

```
vcc open
```

```
vcc open {id}
```

