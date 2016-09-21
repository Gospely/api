echo "please enter commit info："

read msg 

git pull origin master

git add .
git commit -a -m "$msg"
git push -u origin master
#sync
ssh root@119.29.243.71 'cd /var/www/gospely/api && git pull'
