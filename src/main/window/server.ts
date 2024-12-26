import path from 'path';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { 
    GLobalPort, 
    DevHtmlPort,
} from '../../config/global_config';
import { getMarkdownContentByIteratorId } from '../processInit/markdown';
import { getRequestByIterator } from '../processInit/mockserver';

let serverStartFlg = false;

export function startServer() {
    let port = process.env.FORMAL_PORT || GLobalPort;
  
    let app = express();
    let staticPath = "";
    if (process.env.NODE_ENV === 'development') {
      const apiProxy = createProxyMiddleware({  
        target: 'http://localhost:' + DevHtmlPort + '/proxy/',
      });
      app.use('/proxy', apiProxy); 
      app.use('/ws', apiProxy); 
    } else {
      staticPath = path.resolve(__dirname, '../renderer/');
      app.use(express.static(staticPath));  
    }
    app.use(express.urlencoded({ extended: true }));
    app.get('/mockserver/:iteratorId/:project/*', (req, res) => {
      let iteratorId = req.params.iteratorId;
      let project = req.params.project;
      let uri = req.originalUrl.split("/").slice(4).join("/");
      let method = req.method;
      getRequestByIterator(iteratorId, project, method, uri, res);
    });
    app.post('/mockserver/:iteratorId/:project/*', (req, res) => {
      let iteratorId = req.params.iteratorId;
      let project = req.params.project;
      let uri = req.originalUrl.split("/").slice(4).join("/");
      let method = req.method;
      getRequestByIterator(iteratorId, project, method, uri, res);
    });
    app.post('/sprint/docs', (req, res) => {
      let iteratorId = req.body.iteratorId;
      getMarkdownContentByIteratorId(iteratorId, res);
    });
    app.get('*', (req, res) => {
      if (process.env.NODE_ENV !== 'development') {
        res.sendFile(path.join(staticPath, 'index.html'));
      }
    });
    app.listen(port, () => {  
      serverStartFlg = true;
    });
}

export function isStarted() : boolean {
    return serverStartFlg;
}