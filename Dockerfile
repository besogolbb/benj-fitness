FROM node:22-alpine

ENV NODE_ENV=production HOST=0.0.0.0 PORT=4173 FITNESS_DATA_DIR=/data
WORKDIR /app

COPY server.cjs exercise-library.js ./
COPY index.html style.css app.js fitness.js motion.js coach3d.js cloud.js ./
COPY assets/vendor.js assets/gym.jpg ./assets/

RUN mkdir -p /data && chown node:node /data && chmod 700 /data
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.cjs"]
