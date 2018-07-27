<template>
  <div id="app">
    <h1 class="text-center">{{ nombre_app +' '+ ver_app}}</h1>
    <form>
        <div class="container form-group">
            <textarea placeholder="Trace" class="form-control" v-model="debug" @input="cleanDebug" @change="cleanDebug" rows=10></textarea>
            <div class="container text-center limpiar">
              <button type="button" @click="limpiarTrace()" class="btn btn-danger">Limpiar</button>
            </div>
        </div>
        <div class="container" v-if='script'>
          <h2>Preparing</h2>
          <pre v-highlightjs='formatSQL(script)'><code class="sql"></code></pre>
          <div class="container text-center">
            <button type="button" @click="copiar(formatSQL(script))" class="btn btn-primary">Copiar</button>
          </div>
        </div>
        <div class="container"  v-if='script'>
          <h2>Parameters</h2>
          <ol>
            <li v-for="(v, i) in vars" :key="i">
                {{ v }}
            </li>
          </ol>
        </div>

        <div class="container" v-if='res'>
          <h2>Script</h2>
          <pre v-highlightjs='formatSQL(res)'><code class="sql"></code></pre>
          <div class="container text-center">
            <button type="button" @click="copiar(formatSQL(res))" class="btn btn-primary">Copiar</button>
          </div>
        </div>
        <div class="container" v-if='res2'>
          <h2>Script (*)</h2>
          <pre v-highlightjs='formatSQL(res2)'><code class="sql"></code></pre>
          <div class="container text-center">
            <button type="button" @click="copiar(formatSQL(res2))" class="btn btn-primary">Copiar</button>
          </div>
        </div>
    </form>  
    <back-to-top bottom="50px" right="50px"  :visibleoffset="voffset">
      <button type="button" class="btn btn-info btn-to-top">
        <font-awesome-icon icon="chevron-up" />
      </button>
    </back-to-top>   
  </div>
</template>

<script>
    import sqlFormatter from "sql-formatter";

    let app;

    let getExp = function (regExp, str, grupo){
      let result = regExp.exec(str);
      if(result && result[grupo]){
        return result[grupo];
      }
      return '';
    }
    
    let getTotal =  function (debug){
      let regExp = /Total: (.+)/g;
      return getExp(regExp,debug,1);
    }

    let getPreparing =  function (debug){
      let regExp = /Preparing: (.+)/g;
      return getExp(regExp,debug,1);
    }

    let getParametros =  function (debug){
      let regExp = /Parameters: (.+)/g;
      return getExp(regExp,debug,1);
    }

    let comillasTimestamp = function (script){
      let s = script.split(', ');
      s.forEach(l => {
        if(l.search('(Timestamp)')>-1){
         let vTimestamp = '\''+l.substring(0,l.length-11)+'\''+'(Timestamp)';
         script = script.replace(l, vTimestamp);
        }
      });
      return script;
    }

    let comillasString = function (script){
      let s = script.split(', ');
      s.forEach(l => {
        if(l.search('(String)')>-1){
         let vstring = '\''+l.substring(0,l.length-8)+'\''+'(String)';
         script = script.replace(l, vstring);
        }
      });
      return script;
    }

    let quitarTipos =  function(parametros){
      if(parametros){
        let v = parametros.replace(/\(.+?\)/g, '');
        return v;
      }
      return '';
    }
    
    let quitarAtributos =  function(sql){
      if(sql){
        return sql.replace(/^select (.+?) from/ig, 'SELECT * FROM');
      }
      return '';
    }

    let comentarSQL =  function(sql){
      if(sql){
        return '-- '+sql+'\n';
      }
      return '';
    }

    let getRes = function(v, script){
        let r = script;
        let i = 0;
        r = r.replace(/\?/g,function(){return v[i++]})
        return r;
    }

    let formatSQL = function(sql){
      return sqlFormatter.format(sql);
    }

    let limpiarTrace = function(){
      app.debug = '';
      app.res='';
      app.vars='';
      app.script='';
      app.res2='';
      app.resc='';
      app.total='';
    }

export default {
  name: 'app',
  data(){
    return {
      nombre_app:'SQL Trace Debug',
      ver_app: '1.2.0',
      debug:'',
      res:'',
      vars:'',
      script:'',
      res2:'',
      resc:'',
      total:'',
      voffset: 200,
      supportsCB:false
    }
  },
  created() {
    if(navigator.clipboard) {
      this.supportsCB = true;
      app = this;
    }
  },
  methods: {
    cleanDebug: function (evt) {
      if(app.debug){
        app.script = getPreparing(app.debug);
        let p = quitarTipos(comillasTimestamp(comillasString(getParametros(app.debug))));
        app.total = getTotal(app.debug);

        if(p){
          app.vars = p.split(', ');
        }else{
          app.vars = [];
        }
        if(app.vars && app.script){
            app.resc = getRes(app.vars, app.script);
          if(app.total){
              app.res = comentarSQL('Total: '+app.total) + app.resc;
              app.res2 = comentarSQL('Total: '+app.total) + quitarAtributos(app.resc);
          }else{
            app.res = app.resc;
            app.res2 = quitarAtributos(app.resc);
          }
        }else{
          app.res = '';
          app.res2 = '';
          app.resc = '';
        }
      }else{
        app.res = '';
        app.vars = '';
        app.script = '';
        app.res2 = '';
        app.resc = '';
      }

    },
    getParametros,
    getPreparing,
    getTotal,
    getRes,
    quitarTipos,
    quitarAtributos,
    formatSQL,
    limpiarTrace,
    copiar:function(valor){
          navigator.clipboard.writeText(valor)
        .then(() => {
          this.message = 'Texto copiado al portapapeles';
          app.$toasted.info(this.message);
        })
      .catch(e => {
        console.error(e);
        this.message = 'No se pudo copiar el texto al portapapeles!!!';
        app.$toasted.error(this.message);
      });
    }
  },
  filters: {
    formatSQL
  }
}
</script>

<style>
pre {
    display: block;
    padding: 9.5px;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.42857143;
    color: #333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.limpiar{
  padding-top: 10px;
}

.btn-to-top {
  width: 60px;
  height: 60px;
  padding: 10px 16px;
  border-radius: 50%;
  font-size: 22px;
  line-height: 22px;
}

#app{
  padding-top:20px;
  padding-bottom:20px;
}

#app h1{
  padding-bottom:20px;
}

</style>
