# Promo Uploader

![img](./assets/screenshot.png)

this repo

    https://github.com/mattcarp/promo-uploader


this example uses no framework (angular, extjs, etc.), and relies only on the tus client library for javascript in the browser, and the reference tusd binary on the server

info on client:

   https://github.com/tus/tus-js-client

info on server (tusd):

   https://github.com/tus/tusd

running hosted version

    http://18.213.229.220:3000/uploader
    

to run locally: currentlly, from root of its sister project media-analysis (should be next to this repo in the file system):

 npm run start

you will need to refresh the browser manually, you spoiled angular brat.


## server config - ec2 t3 small
ip 

    18.213.229.220

tusd dir

   /usr/bin/tusd 

export en vars for tusd (ask matt for keys)

    export AWS_ACCESS_KEY_ID=xxxxx
    export AWS_SECRET_ACCESS_KEY=xxxxx
    export AWS_REGION=us-east-1

run tusd from its directory, specifying bucket

  tusd -s3-bucket=tus-upload-demo

//  or is it s3-bucket=tus-upload-demo.s3-website-us-east-1.amazonaws.com ?

see - https://github.com/tus/tusd/blob/master/docs/usage-binary.md
