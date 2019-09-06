---
title: Running an OpenAI Gym on Windows with WSL
tags:
- AI
- OpenAI
- WSL
- Linux
- Tensorflow
---
In this blogpost I'll show you how to run an [OpenAI Gym](https://github.com/openai/gym) on Windows using the Windows Subsystem for Linux (WSL).
Some features of the OpenAI Gym are not supported for Windows, such as the Atari based games.
Because of that 

## Install WSL for Windows 
First get WSL installed, I took the `Ubuntu 18.04 LTS` version. You can get it via the [Microsoft Store](https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q?activetab=pivot:overviewtab).
1. Don't forget to execute the Powershell command in Admin mode.

```Powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```
2. Setup a username and password.
3. Update Ubuntu and its packages.

```
sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get upgrade -y && sudo apt-get dist-upgrade -y && sudo apt-get autoremove -y
```

*For a complete guide on installing WSL on Windows please visit this [website](https://docs.microsoft.com/en-us/windows/wsl/install-win10)*.

## Screen mirroring
WSL doesn't come with a graphical user interface. OpenAI Gym however does require a user interface. We can 

1. Download and install [Xming X Server for Windows](https://sourceforge.net/projects/xming/)

```bash
"export DISPLAY=localhost:0.0" >> ~/.bashrc
```
2. Restart the bash terminal or execute this command.

```bash
. ~/.bashrc
```

## Anaconda and Gyn creation

1. Install Anaconda

Install Anaconda's dependencies.

```bash
sudo apt-get install cmake zlib1g-dev xorg-dev libgtk2.0-0 python-matplotlib swig python-opengl xvfb
```
Download the shell script for Anaconda.

```bash
wget https://repo.continuum.io/archive/Anaconda3-5.2.0-Linux-x86_64.sh
```
Make it executable.

```bash
chmod +x Anaconda3-5.2.0-Linux-x86_64.sh
```
Execute it.

```bash
./Anaconda3-5.2.0-Linux-x86_64.sh
```
Refresh the bash or start the terminal.

```
. ~/.bashrc
```

2. Create an environment

```bash
conda create --name gym python=3.5
```
3. Activate the environment

```bash
(gym) user@machine: source activate gym
```


4. Install OpenAI Gym and its dependencies

```bash 
git clone https://github.com/openai/gym
cd gym
```

```bash
(gym) user@machine: pip install -e .[all]
```

## VS Code



## Run examples
```bash
pip install gym[atari]
```

source deactivate

```python
print(env.unwrapped.get_action_meanings())
```