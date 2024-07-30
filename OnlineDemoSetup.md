# Umbra POS Retails Online Demo

# 1. Creating Dummy Organizations

### Go to Umbra Systems as Super Admin
1. Settings > Organizations 
2. Create New 
3. Select Create as Dummy Organization and fill the fields.
![Reference Image](/public/screenshots/image.png)
4. Click Save.

# 2. Enable POS for Dummy User in that Organization

1. In Umbra Systems click Users tab.
2. Click Edit User.
3. Choose Umbra POS in the Solutions field.
![Reference Image](/public/screenshots/image-1.png)
4. Click Save.

# 3. Go to online demo url

1. At first it will prompt the not found page.
2. The REACT_APP_USER_SECRET in the .env file is important.
3. To access/bypass this page you need to put the REACT_APP_USER_SECRET in the page parameter.
4. For Example. https://online-demo.com?uid=MY_SECRET_KEY
5. This will redirect to the login page.
6. You can use the super admin account to login.

# 4. Giving access to client to use the online demo

1. Go to Organizations tab.
2. Click on the ellipsis and Select Enabled.
![Reference Image](/public/screenshots/image-2.png)
3. Click on the ellipsis and Select Copy Link.
![Reference Image](/public/screenshots/image-3.png)
4. Now you can send this link to the client who will use the online demo.


# Running in Development
## Prerequisite: You need Umbra Systems setup and ready in your local machine.
1. Download NodeJS in your device.

*RECOMMENDED VERSION:*

- `node`: 21.5.0
- `npm`: 10.2.4

2. Clone Repository

3. Copy .env.example into .env.local

4. Run using `npm start`