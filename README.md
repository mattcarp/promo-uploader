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

export en vars for tusd, and start it with transfer acceleration (and never put secrets in github repos):

    cd /usr/bin/tusd/
    export AWS_ACCESS_KEY_ID=AKIAXHIYZQ3XPYUVADWP
    export AWS_SECRET_ACCESS_KEY=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
    export AWS_REGION=us-east-1
    tusd -s3-bucket=tus-upload-demo -s3-transfer-acceleration



see - https://github.com/tus/tusd/blob/master/docs/usage-binary.md
