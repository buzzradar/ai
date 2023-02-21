# 🤖 Buzz Radar AI Apps
Repository for AI apps, client and server side

Based on: https://www.youtube.com/watch?v=2FeymQoKvrk

Requirements
------------
1. NodeJs (use nvm to install) https://www.linode.com/docs/guides/how-to-install-use-node-version-manager-nvm/
2. npm (comes with NodeJs)
3. git clone this repo
4. git checkout develop

Installing dependencies
--------------------------------------

1. "frontend" cd into client/.. e.g. "ibot"
2. "backend" cd into server
3. `npm install`

Running the project client side
https://vitejs.dev/config/
--------------------------------------

1. go in respective project, e.g. client/ibot
2. `npm run dev`
3. to dist `npm run build` https://vitejs.dev/guide/static-deploy.html
4. to preview `npm run preview`

Running the project server side
--------------------------------------

1. .env file should be place in server folder for openAI API keys https://platform.openai.com/account/api-keys
OPENAI_API_ORG = XXXX
OPENAI_API_KEY = XXXX

2. cd into server folder
3. `npm run server`
4. to deploy update on github
5. update on https://dashboard.render.com/
6. Immo's test server is here https://ai-gmed.onrender.com/
7. to see the various routes available check out server/server.js

