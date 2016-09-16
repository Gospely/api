echo "please enter commit info："

read msg 

git pull origin master

git add .
git commit -a -m "$msg"
git push -u origin master
#sync
ssh root@poimoe.com 'cd /var/www/gospely/api && git pull'
