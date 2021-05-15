#!/bin/bash
pub_key="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDUiAaJXWWz8w8wr05rJ3wRYSB51iCZppKWS/BQKBtJ4jUVOVUltO4jlNxRZMP8c+tjZk5YtGdsGsboK4NXvt4ywg1C/61aDGag8HKBsqlkw5S4kCyHiIlhfODN7OFPfPxEd+SzPXqMH3I7B22xL2kLhG0KOnH0ZfHwOcNNn1Gkv6FLxFh7Y83endNIYfnyBGf5TmFO1hW78RxvYcc9oOSyVpceLPRx7fFCm3xnPeBpc3qcGEqhbBCo4JnFyCGE60RuJEIu3jtAiVw5y+uTvxHDVySdW38K4xHBZ2J51UpYCrK8MvBIYVhM3KQ0gdjZFjyoDwqjJOUkjrtWbrMsemHb kb@ubuntu"

sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get -y install apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get -y install docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER

#rm -rf ~/.ssh && mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && chmod -R 0600 ~/.ssh && echo $pub_key >> ~/.ssh/authorized_keys