var ke={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je=function(t){const e=[];let n=0;for(let s=0;s<t.length;s++){let r=t.charCodeAt(s);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&s+1<t.length&&(t.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++s)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},Lt=function(t){const e=[];let n=0,s=0;for(;n<t.length;){const r=t[n++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=t[n++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=t[n++],o=t[n++],c=t[n++],l=((r&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[s++]=String.fromCharCode(55296+(l>>10)),e[s++]=String.fromCharCode(56320+(l&1023))}else{const i=t[n++],o=t[n++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Ye={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<t.length;r+=3){const i=t[r],o=r+1<t.length,c=o?t[r+1]:0,l=r+2<t.length,u=l?t[r+2]:0,h=i>>2,p=(i&3)<<4|c>>4;let I=(c&15)<<2|u>>6,F=u&63;l||(F=64,o||(I=64)),s.push(n[h],n[p],n[I],n[F])}return s.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Je(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Lt(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<t.length;){const i=n[t.charAt(r++)],c=r<t.length?n[t.charAt(r)]:0;++r;const u=r<t.length?n[t.charAt(r)]:64;++r;const p=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||c==null||u==null||p==null)throw new Bt;const I=i<<2|c>>4;if(s.push(I),u!==64){const F=c<<4&240|u>>2;if(s.push(F),p!==64){const xt=u<<6&192|p;s.push(xt)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Bt extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Ut=function(t){const e=Je(t);return Ye.encodeByteArray(e,!0)},Qe=function(t){return Ut(t).replace(/\./g,"")},$t=function(t){try{return Ye.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ft(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jt=()=>Ft().__FIREBASE_DEFAULTS__,Ht=()=>{if(typeof process>"u"||typeof ke>"u")return;const t=ke.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Kt=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&$t(t[1]);return e&&JSON.parse(e)},Wt=()=>{try{return jt()||Ht()||Kt()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Xe=()=>{var t;return(t=Wt())===null||t===void 0?void 0:t.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vt=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,s))}}};function Ze(){try{return typeof indexedDB=="object"}catch{return!1}}function et(){return new Promise((t,e)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(s),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var i;e(((i=r.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qt="FirebaseError";class N extends Error{constructor(e,n,s){super(n),this.code=e,this.customData=s,this.name=qt,Object.setPrototypeOf(this,N.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,z.prototype.create)}}class z{constructor(e,n,s){this.service=e,this.serviceName=n,this.errors=s}create(e,...n){const s=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],o=i?zt(i,s):"Error",c=`${this.serviceName}: ${o} (${r}).`;return new N(r,c,s)}}function zt(t,e){return t.replace(Gt,(n,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const Gt=/\{\$([^}]+)}/g;function ue(t,e){if(t===e)return!0;const n=Object.keys(t),s=Object.keys(e);for(const r of n){if(!s.includes(r))return!1;const i=t[r],o=e[r];if(Oe(i)&&Oe(o)){if(!ue(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!n.includes(r))return!1;return!0}function Oe(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tt(t){return t&&t._delegate?t._delegate:t}class T{constructor(e,n,s){this.name=e,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const v="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const s=new Vt;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const s=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Qt(e))try{this.getOrInitializeService({instanceIdentifier:v})}catch{}for(const[n,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(e=v){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=v){return this.instances.has(e)}getOptions(e=v){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);s===c&&o.resolve(r)}return r}onInit(e,n){var s;const r=this.normalizeInstanceIdentifier(n),i=(s=this.onInitCallbacks.get(r))!==null&&s!==void 0?s:new Set;i.add(e),this.onInitCallbacks.set(r,i);const o=this.instances.get(r);return o&&e(o,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const s=this.onInitCallbacks.get(n);if(s)for(const r of s)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Yt(e),options:n}),this.instances.set(e,s),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=v){return this.component?this.component.multipleInstances?e:v:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Yt(t){return t===v?void 0:t}function Qt(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Jt(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var d;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(d||(d={}));const Zt={debug:d.DEBUG,verbose:d.VERBOSE,info:d.INFO,warn:d.WARN,error:d.ERROR,silent:d.SILENT},en=d.INFO,tn={[d.DEBUG]:"log",[d.VERBOSE]:"log",[d.INFO]:"info",[d.WARN]:"warn",[d.ERROR]:"error"},nn=(t,e,...n)=>{if(e<t.logLevel)return;const s=new Date().toISOString(),r=tn[e];if(r)console[r](`[${s}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class sn{constructor(e){this.name=e,this._logLevel=en,this._logHandler=nn,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in d))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Zt[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,d.DEBUG,...e),this._logHandler(this,d.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,d.VERBOSE,...e),this._logHandler(this,d.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,d.INFO,...e),this._logHandler(this,d.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,d.WARN,...e),this._logHandler(this,d.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,d.ERROR,...e),this._logHandler(this,d.ERROR,...e)}}const rn=(t,e)=>e.some(n=>t instanceof n);let Ne,Me;function an(){return Ne||(Ne=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function on(){return Me||(Me=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const nt=new WeakMap,he=new WeakMap,st=new WeakMap,Z=new WeakMap,be=new WeakMap;function cn(t){const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(b(t.result)),r()},o=()=>{s(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&nt.set(n,t)}).catch(()=>{}),be.set(e,t),e}function ln(t){if(he.has(t))return;const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),r()},o=()=>{s(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});he.set(t,e)}let de={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return he.get(t);if(e==="objectStoreNames")return t.objectStoreNames||st.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return b(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function un(t){de=t(de)}function hn(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const s=t.call(ee(this),e,...n);return st.set(s,e.sort?e.sort():[e]),b(s)}:on().includes(t)?function(...e){return t.apply(ee(this),e),b(nt.get(this))}:function(...e){return b(t.apply(ee(this),e))}}function dn(t){return typeof t=="function"?hn(t):(t instanceof IDBTransaction&&ln(t),rn(t,an())?new Proxy(t,de):t)}function b(t){if(t instanceof IDBRequest)return cn(t);if(Z.has(t))return Z.get(t);const e=dn(t);return e!==t&&(Z.set(t,e),be.set(e,t)),e}const ee=t=>be.get(t);function $(t,e,{blocked:n,upgrade:s,blocking:r,terminated:i}={}){const o=indexedDB.open(t,e),c=b(o);return s&&o.addEventListener("upgradeneeded",l=>{s(b(o.result),l.oldVersion,l.newVersion,b(o.transaction),l)}),n&&o.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),c.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",u=>r(u.oldVersion,u.newVersion,u))}).catch(()=>{}),c}function H(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",s=>e(s.oldVersion,s)),b(n).then(()=>{})}const fn=["get","getKey","getAll","getAllKeys","count"],pn=["put","add","delete","clear"],te=new Map;function Pe(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(te.get(e))return te.get(e);const n=e.replace(/FromIndex$/,""),s=e!==n,r=pn.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||fn.includes(n)))return;const i=async function(o,...c){const l=this.transaction(o,r?"readwrite":"readonly");let u=l.store;return s&&(u=u.index(c.shift())),(await Promise.all([u[n](...c),r&&l.done]))[0]};return te.set(e,i),i}un(t=>({...t,get:(e,n,s)=>Pe(e,n)||t.get(e,n,s),has:(e,n)=>!!Pe(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gn{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(mn(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function mn(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const fe="@firebase/app",xe="0.10.16";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const y=new sn("@firebase/app"),wn="@firebase/app-compat",bn="@firebase/analytics-compat",yn="@firebase/analytics",_n="@firebase/app-check-compat",En="@firebase/app-check",Cn="@firebase/auth",In="@firebase/auth-compat",vn="@firebase/database",Sn="@firebase/data-connect",Tn="@firebase/database-compat",An="@firebase/functions",Dn="@firebase/functions-compat",Rn="@firebase/installations",kn="@firebase/installations-compat",On="@firebase/messaging",Nn="@firebase/messaging-compat",Mn="@firebase/performance",Pn="@firebase/performance-compat",xn="@firebase/remote-config",Ln="@firebase/remote-config-compat",Bn="@firebase/storage",Un="@firebase/storage-compat",$n="@firebase/firestore",Fn="@firebase/vertexai",jn="@firebase/firestore-compat",Hn="firebase";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pe="[DEFAULT]",Kn={[fe]:"fire-core",[wn]:"fire-core-compat",[yn]:"fire-analytics",[bn]:"fire-analytics-compat",[En]:"fire-app-check",[_n]:"fire-app-check-compat",[Cn]:"fire-auth",[In]:"fire-auth-compat",[vn]:"fire-rtdb",[Sn]:"fire-data-connect",[Tn]:"fire-rtdb-compat",[An]:"fire-fn",[Dn]:"fire-fn-compat",[Rn]:"fire-iid",[kn]:"fire-iid-compat",[On]:"fire-fcm",[Nn]:"fire-fcm-compat",[Mn]:"fire-perf",[Pn]:"fire-perf-compat",[xn]:"fire-rc",[Ln]:"fire-rc-compat",[Bn]:"fire-gcs",[Un]:"fire-gcs-compat",[$n]:"fire-fst",[jn]:"fire-fst-compat",[Fn]:"fire-vertex","fire-js":"fire-js",[Hn]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B=new Map,Wn=new Map,ge=new Map;function Le(t,e){try{t.container.addComponent(e)}catch(n){y.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function O(t){const e=t.name;if(ge.has(e))return y.debug(`There were multiple attempts to register component ${e}.`),!1;ge.set(e,t);for(const n of B.values())Le(n,t);for(const n of Wn.values())Le(n,t);return!0}function ye(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},C=new z("app","Firebase",Vn);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(e,n,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new T("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw C.create("app-deleted",{appName:this._name})}}function rt(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const s=Object.assign({name:pe,automaticDataCollectionEnabled:!1},e),r=s.name;if(typeof r!="string"||!r)throw C.create("bad-app-name",{appName:String(r)});if(n||(n=Xe()),!n)throw C.create("no-options");const i=B.get(r);if(i){if(ue(n,i.options)&&ue(s,i.config))return i;throw C.create("duplicate-app",{appName:r})}const o=new Xt(r);for(const l of ge.values())o.addComponent(l);const c=new qn(n,s,o);return B.set(r,c),c}function zn(t=pe){const e=B.get(t);if(!e&&t===pe&&Xe())return rt();if(!e)throw C.create("no-app",{appName:t});return e}function Be(){return Array.from(B.values())}function k(t,e,n){var s;let r=(s=Kn[t])!==null&&s!==void 0?s:t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const c=[`Unable to register library "${r}" with version "${e}":`];i&&c.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&o&&c.push("and"),o&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),y.warn(c.join(" "));return}O(new T(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn="firebase-heartbeat-database",Jn=1,U="firebase-heartbeat-store";let ne=null;function it(){return ne||(ne=$(Gn,Jn,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(U)}catch(n){console.warn(n)}}}}).catch(t=>{throw C.create("idb-open",{originalErrorMessage:t.message})})),ne}async function Yn(t){try{const n=(await it()).transaction(U),s=await n.objectStore(U).get(at(t));return await n.done,s}catch(e){if(e instanceof N)y.warn(e.message);else{const n=C.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});y.warn(n.message)}}}async function Ue(t,e){try{const s=(await it()).transaction(U,"readwrite");await s.objectStore(U).put(e,at(t)),await s.done}catch(n){if(n instanceof N)y.warn(n.message);else{const s=C.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});y.warn(s.message)}}}function at(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qn=1024,Xn=30*24*60*60*1e3;class Zn{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new ts(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,n;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=$e();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:r}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const c=new Date(o.date).valueOf();return Date.now()-c<=Xn}),this._storage.overwrite(this._heartbeatsCache))}catch(s){y.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=$e(),{heartbeatsToSend:s,unsentEntries:r}=es(this._heartbeatsCache.heartbeats),i=Qe(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=n,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return y.warn(n),""}}}function $e(){return new Date().toISOString().substring(0,10)}function es(t,e=Qn){const n=[];let s=t.slice();for(const r of t){const i=n.find(o=>o.agent===r.agent);if(i){if(i.dates.push(r.date),Fe(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),Fe(n)>e){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}class ts{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ze()?et().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Yn(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const r=await this.read();return Ue(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const r=await this.read();return Ue(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Fe(t){return Qe(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ns(t){O(new T("platform-logger",e=>new gn(e),"PRIVATE")),O(new T("heartbeat",e=>new Zn(e),"PRIVATE")),k(fe,xe,t),k(fe,xe,"esm2017"),k("fire-js","")}ns("");var ss="firebase",rs="11.0.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */k(ss,rs,"app");const ot="@firebase/installations",_e="0.6.11";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ct=1e4,lt=`w:${_e}`,ut="FIS_v2",is="https://firebaseinstallations.googleapis.com/v1",as=60*60*1e3,os="installations",cs="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ls={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},A=new z(os,cs,ls);function ht(t){return t instanceof N&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dt({projectId:t}){return`${is}/projects/${t}/installations`}function ft(t){return{token:t.token,requestStatus:2,expiresIn:hs(t.expiresIn),creationTime:Date.now()}}async function pt(t,e){const s=(await e.json()).error;return A.create("request-failed",{requestName:t,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})}function gt({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function us(t,{refreshToken:e}){const n=gt(t);return n.append("Authorization",ds(e)),n}async function mt(t){const e=await t();return e.status>=500&&e.status<600?t():e}function hs(t){return Number(t.replace("s","000"))}function ds(t){return`${ut} ${t}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fs({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const s=dt(t),r=gt(t),i=e.getImmediate({optional:!0});if(i){const u=await i.getHeartbeatsHeader();u&&r.append("x-firebase-client",u)}const o={fid:n,authVersion:ut,appId:t.appId,sdkVersion:lt},c={method:"POST",headers:r,body:JSON.stringify(o)},l=await mt(()=>fetch(s,c));if(l.ok){const u=await l.json();return{fid:u.fid||n,registrationStatus:2,refreshToken:u.refreshToken,authToken:ft(u.authToken)}}else throw await pt("Create Installation",l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wt(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ps(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gs=/^[cdef][\w-]{21}$/,me="";function ms(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=ws(t);return gs.test(n)?n:me}catch{return me}}function ws(t){return ps(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G(t){return`${t.appName}!${t.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bt=new Map;function yt(t,e){const n=G(t);_t(n,e),bs(n,e)}function _t(t,e){const n=bt.get(t);if(n)for(const s of n)s(e)}function bs(t,e){const n=ys();n&&n.postMessage({key:t,fid:e}),_s()}let S=null;function ys(){return!S&&"BroadcastChannel"in self&&(S=new BroadcastChannel("[Firebase] FID Change"),S.onmessage=t=>{_t(t.data.key,t.data.fid)}),S}function _s(){bt.size===0&&S&&(S.close(),S=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Es="firebase-installations-database",Cs=1,D="firebase-installations-store";let se=null;function Ee(){return se||(se=$(Es,Cs,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(D)}}})),se}async function K(t,e){const n=G(t),r=(await Ee()).transaction(D,"readwrite"),i=r.objectStore(D),o=await i.get(n);return await i.put(e,n),await r.done,(!o||o.fid!==e.fid)&&yt(t,e.fid),e}async function Et(t){const e=G(t),s=(await Ee()).transaction(D,"readwrite");await s.objectStore(D).delete(e),await s.done}async function J(t,e){const n=G(t),r=(await Ee()).transaction(D,"readwrite"),i=r.objectStore(D),o=await i.get(n),c=e(o);return c===void 0?await i.delete(n):await i.put(c,n),await r.done,c&&(!o||o.fid!==c.fid)&&yt(t,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ce(t){let e;const n=await J(t.appConfig,s=>{const r=Is(s),i=vs(t,r);return e=i.registrationPromise,i.installationEntry});return n.fid===me?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function Is(t){const e=t||{fid:ms(),registrationStatus:0};return Ct(e)}function vs(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(A.create("app-offline"));return{installationEntry:e,registrationPromise:r}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},s=Ss(t,n);return{installationEntry:n,registrationPromise:s}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Ts(t)}:{installationEntry:e}}async function Ss(t,e){try{const n=await fs(t,e);return K(t.appConfig,n)}catch(n){throw ht(n)&&n.customData.serverCode===409?await Et(t.appConfig):await K(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function Ts(t){let e=await je(t.appConfig);for(;e.registrationStatus===1;)await wt(100),e=await je(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:s}=await Ce(t);return s||n}return e}function je(t){return J(t,e=>{if(!e)throw A.create("installation-not-found");return Ct(e)})}function Ct(t){return As(t)?{fid:t.fid,registrationStatus:0}:t}function As(t){return t.registrationStatus===1&&t.registrationTime+ct<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ds({appConfig:t,heartbeatServiceProvider:e},n){const s=Rs(t,n),r=us(t,n),i=e.getImmediate({optional:!0});if(i){const u=await i.getHeartbeatsHeader();u&&r.append("x-firebase-client",u)}const o={installation:{sdkVersion:lt,appId:t.appId}},c={method:"POST",headers:r,body:JSON.stringify(o)},l=await mt(()=>fetch(s,c));if(l.ok){const u=await l.json();return ft(u)}else throw await pt("Generate Auth Token",l)}function Rs(t,{fid:e}){return`${dt(t)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ie(t,e=!1){let n;const s=await J(t.appConfig,i=>{if(!It(i))throw A.create("not-registered");const o=i.authToken;if(!e&&Ns(o))return i;if(o.requestStatus===1)return n=ks(t,e),i;{if(!navigator.onLine)throw A.create("app-offline");const c=Ps(i);return n=Os(t,c),c}});return n?await n:s.authToken}async function ks(t,e){let n=await He(t.appConfig);for(;n.authToken.requestStatus===1;)await wt(100),n=await He(t.appConfig);const s=n.authToken;return s.requestStatus===0?Ie(t,e):s}function He(t){return J(t,e=>{if(!It(e))throw A.create("not-registered");const n=e.authToken;return xs(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function Os(t,e){try{const n=await Ds(t,e),s=Object.assign(Object.assign({},e),{authToken:n});return await K(t.appConfig,s),n}catch(n){if(ht(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Et(t.appConfig);else{const s=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await K(t.appConfig,s)}throw n}}function It(t){return t!==void 0&&t.registrationStatus===2}function Ns(t){return t.requestStatus===2&&!Ms(t)}function Ms(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+as}function Ps(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function xs(t){return t.requestStatus===1&&t.requestTime+ct<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ls(t){const e=t,{installationEntry:n,registrationPromise:s}=await Ce(e);return s?s.catch(console.error):Ie(e).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bs(t,e=!1){const n=t;return await Us(n),(await Ie(n,e)).token}async function Us(t){const{registrationPromise:e}=await Ce(t);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $s(t){if(!t||!t.options)throw re("App Configuration");if(!t.name)throw re("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw re(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function re(t){return A.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vt="installations",Fs="installations-internal",js=t=>{const e=t.getProvider("app").getImmediate(),n=$s(e),s=ye(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:s,_delete:()=>Promise.resolve()}},Hs=t=>{const e=t.getProvider("app").getImmediate(),n=ye(e,vt).getImmediate();return{getId:()=>Ls(n),getToken:r=>Bs(n,r)}};function Ks(){O(new T(vt,js,"PUBLIC")),O(new T(Fs,Hs,"PRIVATE"))}Ks();k(ot,_e);k(ot,_e,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const St="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Ws="https://fcmregistrations.googleapis.com/v1",Tt="FCM_MSG",Vs="google.c.a.c_id",qs=3,zs=1;var W;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(W||(W={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var V;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(V||(V={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function m(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Gs(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),s=atob(n),r=new Uint8Array(s.length);for(let i=0;i<s.length;++i)r[i]=s.charCodeAt(i);return r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ie="fcm_token_details_db",Js=5,Ke="fcm_token_object_Store";async function Ys(t){if("databases"in indexedDB&&!(await indexedDB.databases()).map(i=>i.name).includes(ie))return null;let e=null;return(await $(ie,Js,{upgrade:async(s,r,i,o)=>{var c;if(r<2||!s.objectStoreNames.contains(Ke))return;const l=o.objectStore(Ke),u=await l.index("fcmSenderId").get(t);if(await l.clear(),!!u){if(r===2){const h=u;if(!h.auth||!h.p256dh||!h.endpoint)return;e={token:h.fcmToken,createTime:(c=h.createTime)!==null&&c!==void 0?c:Date.now(),subscriptionOptions:{auth:h.auth,p256dh:h.p256dh,endpoint:h.endpoint,swScope:h.swScope,vapidKey:typeof h.vapidKey=="string"?h.vapidKey:m(h.vapidKey)}}}else if(r===3){const h=u;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:m(h.auth),p256dh:m(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:m(h.vapidKey)}}}else if(r===4){const h=u;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:m(h.auth),p256dh:m(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:m(h.vapidKey)}}}}}})).close(),await H(ie),await H("fcm_vapid_details_db"),await H("undefined"),Qs(e)?e:null}function Qs(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xs="firebase-messaging-database",Zs=1,R="firebase-messaging-store";let ae=null;function ve(){return ae||(ae=$(Xs,Zs,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(R)}}})),ae}async function Se(t){const e=Ae(t),s=await(await ve()).transaction(R).objectStore(R).get(e);if(s)return s;{const r=await Ys(t.appConfig.senderId);if(r)return await Te(t,r),r}}async function Te(t,e){const n=Ae(t),r=(await ve()).transaction(R,"readwrite");return await r.objectStore(R).put(e,n),await r.done,e}async function er(t){const e=Ae(t),s=(await ve()).transaction(R,"readwrite");await s.objectStore(R).delete(e),await s.done}function Ae({appConfig:t}){return t.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tr={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},g=new z("messaging","Messaging",tr);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nr(t,e){const n=await Re(t),s=Dt(e),r={method:"POST",headers:n,body:JSON.stringify(s)};let i;try{i=await(await fetch(De(t.appConfig),r)).json()}catch(o){throw g.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(i.error){const o=i.error.message;throw g.create("token-subscribe-failed",{errorInfo:o})}if(!i.token)throw g.create("token-subscribe-no-token");return i.token}async function sr(t,e){const n=await Re(t),s=Dt(e.subscriptionOptions),r={method:"PATCH",headers:n,body:JSON.stringify(s)};let i;try{i=await(await fetch(`${De(t.appConfig)}/${e.token}`,r)).json()}catch(o){throw g.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(i.error){const o=i.error.message;throw g.create("token-update-failed",{errorInfo:o})}if(!i.token)throw g.create("token-update-no-token");return i.token}async function At(t,e){const s={method:"DELETE",headers:await Re(t)};try{const i=await(await fetch(`${De(t.appConfig)}/${e}`,s)).json();if(i.error){const o=i.error.message;throw g.create("token-unsubscribe-failed",{errorInfo:o})}}catch(r){throw g.create("token-unsubscribe-failed",{errorInfo:r==null?void 0:r.toString()})}}function De({projectId:t}){return`${Ws}/projects/${t}/registrations`}async function Re({appConfig:t,installations:e}){const n=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":`FIS ${n}`})}function Dt({p256dh:t,auth:e,endpoint:n,vapidKey:s}){const r={web:{endpoint:n,auth:e,p256dh:t}};return s!==St&&(r.web.applicationPubKey=s),r}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rr=7*24*60*60*1e3;async function ir(t){const e=await or(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:m(e.getKey("auth")),p256dh:m(e.getKey("p256dh"))},s=await Se(t.firebaseDependencies);if(s){if(cr(s.subscriptionOptions,n))return Date.now()>=s.createTime+rr?ar(t,{token:s.token,createTime:Date.now(),subscriptionOptions:n}):s.token;try{await At(t.firebaseDependencies,s.token)}catch(r){console.warn(r)}return Ve(t.firebaseDependencies,n)}else return Ve(t.firebaseDependencies,n)}async function We(t){const e=await Se(t.firebaseDependencies);e&&(await At(t.firebaseDependencies,e.token),await er(t.firebaseDependencies));const n=await t.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0}async function ar(t,e){try{const n=await sr(t.firebaseDependencies,e),s=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return await Te(t.firebaseDependencies,s),n}catch(n){throw n}}async function Ve(t,e){const s={token:await nr(t,e),createTime:Date.now(),subscriptionOptions:e};return await Te(t,s),s.token}async function or(t,e){const n=await t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Gs(e)})}function cr(t,e){const n=e.vapidKey===t.vapidKey,s=e.endpoint===t.endpoint,r=e.auth===t.auth,i=e.p256dh===t.p256dh;return n&&s&&r&&i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lr(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return ur(e,t),hr(e,t),dr(e,t),e}function ur(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const s=e.notification.body;s&&(t.notification.body=s);const r=e.notification.image;r&&(t.notification.image=r);const i=e.notification.icon;i&&(t.notification.icon=i)}function hr(t,e){e.data&&(t.data=e.data)}function dr(t,e){var n,s,r,i,o;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const c=(r=(s=e.fcmOptions)===null||s===void 0?void 0:s.link)!==null&&r!==void 0?r:(i=e.notification)===null||i===void 0?void 0:i.click_action;c&&(t.fcmOptions.link=c);const l=(o=e.fcmOptions)===null||o===void 0?void 0:o.analytics_label;l&&(t.fcmOptions.analyticsLabel=l)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fr(t){return typeof t=="object"&&!!t&&Vs in t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pr(t){return new Promise(e=>{setTimeout(e,t)})}async function gr(t,e){const n=mr(e,await t.firebaseDependencies.installations.getId());wr(t,n,e.productId)}function mr(t,e){var n,s;const r={};return t.from&&(r.project_number=t.from),t.fcmMessageId&&(r.message_id=t.fcmMessageId),r.instance_id=e,t.notification?r.message_type=W.DISPLAY_NOTIFICATION.toString():r.message_type=W.DATA_MESSAGE.toString(),r.sdk_platform=qs.toString(),r.package_name=self.origin.replace(/(^\w+:|^)\/\//,""),t.collapse_key&&(r.collapse_key=t.collapse_key),r.event=zs.toString(),!((n=t.fcmOptions)===null||n===void 0)&&n.analytics_label&&(r.analytics_label=(s=t.fcmOptions)===null||s===void 0?void 0:s.analytics_label),r}function wr(t,e,n){const s={};s.event_time_ms=Math.floor(Date.now()).toString(),s.source_extension_json_proto3=JSON.stringify({messaging_client_event:e}),n&&(s.compliance_data=br(n)),t.logEvents.push(s)}function br(t){return{privacy_context:{prequest:{origin_associated_product_id:t}}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yr(t,e){var n,s;const{newSubscription:r}=t;if(!r){await We(e);return}const i=await Se(e.firebaseDependencies);await We(e),e.vapidKey=(s=(n=i==null?void 0:i.subscriptionOptions)===null||n===void 0?void 0:n.vapidKey)!==null&&s!==void 0?s:St,await ir(e)}async function _r(t,e){const n=Ir(t);if(!n)return;e.deliveryMetricsExportedToBigQueryEnabled&&await gr(e,n);const s=await Rt();if(Sr(s))return Tr(s,n);if(n.notification&&await Ar(Cr(n)),!!e&&e.onBackgroundMessageHandler){const r=lr(n);typeof e.onBackgroundMessageHandler=="function"?await e.onBackgroundMessageHandler(r):e.onBackgroundMessageHandler.next(r)}}async function Er(t){var e,n;const s=(n=(e=t.notification)===null||e===void 0?void 0:e.data)===null||n===void 0?void 0:n[Tt];if(s){if(t.action)return}else return;t.stopImmediatePropagation(),t.notification.close();const r=Dr(s);if(!r)return;const i=new URL(r,self.location.href),o=new URL(self.location.origin);if(i.host!==o.host)return;let c=await vr(i);if(c?c=await c.focus():(c=await self.clients.openWindow(r),await pr(3e3)),!!c)return s.messageType=V.NOTIFICATION_CLICKED,s.isFirebaseMessaging=!0,c.postMessage(s)}function Cr(t){const e=Object.assign({},t.notification);return e.data={[Tt]:t},e}function Ir({data:t}){if(!t)return null;try{return t.json()}catch{return null}}async function vr(t){const e=await Rt();for(const n of e){const s=new URL(n.url,self.location.href);if(t.host===s.host)return n}return null}function Sr(t){return t.some(e=>e.visibilityState==="visible"&&!e.url.startsWith("chrome-extension://"))}function Tr(t,e){e.isFirebaseMessaging=!0,e.messageType=V.PUSH_RECEIVED;for(const n of t)n.postMessage(e)}function Rt(){return self.clients.matchAll({type:"window",includeUncontrolled:!0})}function Ar(t){var e;const{actions:n}=t,{maxActions:s}=Notification;return n&&s&&n.length>s&&console.warn(`This browser only supports ${s} actions. The remaining actions will not be displayed.`),self.registration.showNotification((e=t.title)!==null&&e!==void 0?e:"",t)}function Dr(t){var e,n,s;const r=(n=(e=t.fcmOptions)===null||e===void 0?void 0:e.link)!==null&&n!==void 0?n:(s=t.notification)===null||s===void 0?void 0:s.click_action;return r||(fr(t.data)?self.location.origin:null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rr(t){if(!t||!t.options)throw oe("App Configuration Object");if(!t.name)throw oe("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const s of e)if(!n[s])throw oe(s);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function oe(t){return g.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kr{constructor(e,n,s){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const r=Rr(e);this.firebaseDependencies={app:e,appConfig:r,installations:n,analyticsProvider:s}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Or=t=>{const e=new kr(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return self.addEventListener("push",n=>{n.waitUntil(_r(n,e))}),self.addEventListener("pushsubscriptionchange",n=>{n.waitUntil(yr(n,e))}),self.addEventListener("notificationclick",n=>{n.waitUntil(Er(n))}),e};function Nr(){O(new T("messaging-sw",Or,"PUBLIC"))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mr(){return Ze()&&await et()&&"PushManager"in self&&"Notification"in self&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pr(t,e){if(self.document!==void 0)throw g.create("only-available-in-sw");return t.onBackgroundMessageHandler=e,()=>{t.onBackgroundMessageHandler=null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xr(t=zn()){return Mr().then(e=>{if(!e)throw g.create("unsupported-browser")},e=>{throw g.create("indexed-db-unsupported")}),ye(tt(t),"messaging-sw").getImmediate()}function Lr(t,e){return t=tt(t),Pr(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Nr();try{self["workbox:core:7.2.0"]&&_()}catch{}const Br=(t,...e)=>{let n=t;return e.length>0&&(n+=` :: ${JSON.stringify(e)}`),n},Ur=Br;class f extends Error{constructor(e,n){const s=Ur(e,n);super(s),this.name=e,this.details=n}}const w={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:typeof registration<"u"?registration.scope:""},ce=t=>[w.prefix,t,w.suffix].filter(e=>e&&e.length>0).join("-"),$r=t=>{for(const e of Object.keys(w))t(e)},Y={updateDetails:t=>{$r(e=>{typeof t[e]=="string"&&(w[e]=t[e])})},getGoogleAnalyticsName:t=>t||ce(w.googleAnalytics),getPrecacheName:t=>t||ce(w.precache),getPrefix:()=>w.prefix,getRuntimeName:t=>t||ce(w.runtime),getSuffix:()=>w.suffix};function qe(t,e){const n=e();return t.waitUntil(n),n}try{self["workbox:precaching:7.2.0"]&&_()}catch{}const Fr="__WB_REVISION__";function jr(t){if(!t)throw new f("add-to-cache-list-unexpected-type",{entry:t});if(typeof t=="string"){const i=new URL(t,location.href);return{cacheKey:i.href,url:i.href}}const{revision:e,url:n}=t;if(!n)throw new f("add-to-cache-list-unexpected-type",{entry:t});if(!e){const i=new URL(n,location.href);return{cacheKey:i.href,url:i.href}}const s=new URL(n,location.href),r=new URL(n,location.href);return s.searchParams.set(Fr,e),{cacheKey:s.href,url:r.href}}class Hr{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:n})=>{n&&(n.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:n,cachedResponse:s})=>{if(e.type==="install"&&n&&n.originalRequest&&n.originalRequest instanceof Request){const r=n.originalRequest.url;s?this.notUpdatedURLs.push(r):this.updatedURLs.push(r)}return s}}}class Kr{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:n,params:s})=>{const r=(s==null?void 0:s.cacheKey)||this._precacheController.getCacheKeyForURL(n.url);return r?new Request(r,{headers:n.headers}):n},this._precacheController=e}}let M;function Wr(){if(M===void 0){const t=new Response("");if("body"in t)try{new Response(t.body),M=!0}catch{M=!1}M=!1}return M}async function Vr(t,e){let n=null;if(t.url&&(n=new URL(t.url).origin),n!==self.location.origin)throw new f("cross-origin-copy-response",{origin:n});const s=t.clone(),i={headers:new Headers(s.headers),status:s.status,statusText:s.statusText},o=Wr()?s.body:await s.blob();return new Response(o,i)}const qr=t=>new URL(String(t),location.href).href.replace(new RegExp(`^${location.origin}`),"");function ze(t,e){const n=new URL(t);for(const s of e)n.searchParams.delete(s);return n.href}async function zr(t,e,n,s){const r=ze(e.url,n);if(e.url===r)return t.match(e,s);const i=Object.assign(Object.assign({},s),{ignoreSearch:!0}),o=await t.keys(e,i);for(const c of o){const l=ze(c.url,n);if(r===l)return t.match(c,s)}}class Gr{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}const kt=new Set;async function Jr(){for(const t of kt)await t()}function Yr(t){return new Promise(e=>setTimeout(e,t))}try{self["workbox:strategies:7.2.0"]&&_()}catch{}function j(t){return typeof t=="string"?new Request(t):t}class Qr{constructor(e,n){this._cacheKeys={},Object.assign(this,n),this.event=n.event,this._strategy=e,this._handlerDeferred=new Gr,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const s of this._plugins)this._pluginStateMap.set(s,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){const{event:n}=this;let s=j(e);if(s.mode==="navigate"&&n instanceof FetchEvent&&n.preloadResponse){const o=await n.preloadResponse;if(o)return o}const r=this.hasCallback("fetchDidFail")?s.clone():null;try{for(const o of this.iterateCallbacks("requestWillFetch"))s=await o({request:s.clone(),event:n})}catch(o){if(o instanceof Error)throw new f("plugin-error-request-will-fetch",{thrownErrorMessage:o.message})}const i=s.clone();try{let o;o=await fetch(s,s.mode==="navigate"?void 0:this._strategy.fetchOptions);for(const c of this.iterateCallbacks("fetchDidSucceed"))o=await c({event:n,request:i,response:o});return o}catch(o){throw r&&await this.runCallbacks("fetchDidFail",{error:o,event:n,originalRequest:r.clone(),request:i.clone()}),o}}async fetchAndCachePut(e){const n=await this.fetch(e),s=n.clone();return this.waitUntil(this.cachePut(e,s)),n}async cacheMatch(e){const n=j(e);let s;const{cacheName:r,matchOptions:i}=this._strategy,o=await this.getCacheKey(n,"read"),c=Object.assign(Object.assign({},i),{cacheName:r});s=await caches.match(o,c);for(const l of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await l({cacheName:r,matchOptions:i,cachedResponse:s,request:o,event:this.event})||void 0;return s}async cachePut(e,n){const s=j(e);await Yr(0);const r=await this.getCacheKey(s,"write");if(!n)throw new f("cache-put-with-no-response",{url:qr(r.url)});const i=await this._ensureResponseSafeToCache(n);if(!i)return!1;const{cacheName:o,matchOptions:c}=this._strategy,l=await self.caches.open(o),u=this.hasCallback("cacheDidUpdate"),h=u?await zr(l,r.clone(),["__WB_REVISION__"],c):null;try{await l.put(r,u?i.clone():i)}catch(p){if(p instanceof Error)throw p.name==="QuotaExceededError"&&await Jr(),p}for(const p of this.iterateCallbacks("cacheDidUpdate"))await p({cacheName:o,oldResponse:h,newResponse:i.clone(),request:r,event:this.event});return!0}async getCacheKey(e,n){const s=`${e.url} | ${n}`;if(!this._cacheKeys[s]){let r=e;for(const i of this.iterateCallbacks("cacheKeyWillBeUsed"))r=j(await i({mode:n,request:r,event:this.event,params:this.params}));this._cacheKeys[s]=r}return this._cacheKeys[s]}hasCallback(e){for(const n of this._strategy.plugins)if(e in n)return!0;return!1}async runCallbacks(e,n){for(const s of this.iterateCallbacks(e))await s(n)}*iterateCallbacks(e){for(const n of this._strategy.plugins)if(typeof n[e]=="function"){const s=this._pluginStateMap.get(n);yield i=>{const o=Object.assign(Object.assign({},i),{state:s});return n[e](o)}}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){let e;for(;e=this._extendLifetimePromises.shift();)await e}destroy(){this._handlerDeferred.resolve(null)}async _ensureResponseSafeToCache(e){let n=e,s=!1;for(const r of this.iterateCallbacks("cacheWillUpdate"))if(n=await r({request:this.request,response:n,event:this.event})||void 0,s=!0,!n)break;return s||n&&n.status!==200&&(n=void 0),n}}class Q{constructor(e={}){this.cacheName=Y.getRuntimeName(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[n]=this.handleAll(e);return n}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const n=e.event,s=typeof e.request=="string"?new Request(e.request):e.request,r="params"in e?e.params:void 0,i=new Qr(this,{event:n,request:s,params:r}),o=this._getResponse(i,s,n),c=this._awaitComplete(o,i,s,n);return[o,c]}async _getResponse(e,n,s){await e.runCallbacks("handlerWillStart",{event:s,request:n});let r;try{if(r=await this._handle(n,e),!r||r.type==="error")throw new f("no-response",{url:n.url})}catch(i){if(i instanceof Error){for(const o of e.iterateCallbacks("handlerDidError"))if(r=await o({error:i,event:s,request:n}),r)break}if(!r)throw i}for(const i of e.iterateCallbacks("handlerWillRespond"))r=await i({event:s,request:n,response:r});return r}async _awaitComplete(e,n,s,r){let i,o;try{i=await e}catch{}try{await n.runCallbacks("handlerDidRespond",{event:r,request:s,response:i}),await n.doneWaiting()}catch(c){c instanceof Error&&(o=c)}if(await n.runCallbacks("handlerDidComplete",{event:r,request:s,response:i,error:o}),n.destroy(),o)throw o}}class E extends Q{constructor(e={}){e.cacheName=Y.getPrecacheName(e.cacheName),super(e),this._fallbackToNetwork=e.fallbackToNetwork!==!1,this.plugins.push(E.copyRedirectedCacheableResponsesPlugin)}async _handle(e,n){const s=await n.cacheMatch(e);return s||(n.event&&n.event.type==="install"?await this._handleInstall(e,n):await this._handleFetch(e,n))}async _handleFetch(e,n){let s;const r=n.params||{};if(this._fallbackToNetwork){const i=r.integrity,o=e.integrity,c=!o||o===i;s=await n.fetch(new Request(e,{integrity:e.mode!=="no-cors"?o||i:void 0})),i&&c&&e.mode!=="no-cors"&&(this._useDefaultCacheabilityPluginIfNeeded(),await n.cachePut(e,s.clone()))}else throw new f("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return s}async _handleInstall(e,n){this._useDefaultCacheabilityPluginIfNeeded();const s=await n.fetch(e);if(!await n.cachePut(e,s.clone()))throw new f("bad-precaching-response",{url:e.url,status:s.status});return s}_useDefaultCacheabilityPluginIfNeeded(){let e=null,n=0;for(const[s,r]of this.plugins.entries())r!==E.copyRedirectedCacheableResponsesPlugin&&(r===E.defaultPrecacheCacheabilityPlugin&&(e=s),r.cacheWillUpdate&&n++);n===0?this.plugins.push(E.defaultPrecacheCacheabilityPlugin):n>1&&e!==null&&this.plugins.splice(e,1)}}E.defaultPrecacheCacheabilityPlugin={async cacheWillUpdate({response:t}){return!t||t.status>=400?null:t}};E.copyRedirectedCacheableResponsesPlugin={async cacheWillUpdate({response:t}){return t.redirected?await Vr(t):t}};class Xr{constructor({cacheName:e,plugins:n=[],fallbackToNetwork:s=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new E({cacheName:Y.getPrecacheName(e),plugins:[...n,new Kr({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const n=[];for(const s of e){typeof s=="string"?n.push(s):s&&s.revision===void 0&&n.push(s.url);const{cacheKey:r,url:i}=jr(s),o=typeof s!="string"&&s.revision?"reload":"default";if(this._urlsToCacheKeys.has(i)&&this._urlsToCacheKeys.get(i)!==r)throw new f("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(i),secondEntry:r});if(typeof s!="string"&&s.integrity){if(this._cacheKeysToIntegrities.has(r)&&this._cacheKeysToIntegrities.get(r)!==s.integrity)throw new f("add-to-cache-list-conflicting-integrities",{url:i});this._cacheKeysToIntegrities.set(r,s.integrity)}if(this._urlsToCacheKeys.set(i,r),this._urlsToCacheModes.set(i,o),n.length>0){const c=`Workbox is precaching URLs without revision info: ${n.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(c)}}}install(e){return qe(e,async()=>{const n=new Hr;this.strategy.plugins.push(n);for(const[i,o]of this._urlsToCacheKeys){const c=this._cacheKeysToIntegrities.get(o),l=this._urlsToCacheModes.get(i),u=new Request(i,{integrity:c,cache:l,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:o},request:u,event:e}))}const{updatedURLs:s,notUpdatedURLs:r}=n;return{updatedURLs:s,notUpdatedURLs:r}})}activate(e){return qe(e,async()=>{const n=await self.caches.open(this.strategy.cacheName),s=await n.keys(),r=new Set(this._urlsToCacheKeys.values()),i=[];for(const o of s)r.has(o.url)||(await n.delete(o),i.push(o.url));return{deletedURLs:i}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const n=new URL(e,location.href);return this._urlsToCacheKeys.get(n.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){const n=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(n);if(s)return(await self.caches.open(this.strategy.cacheName)).match(s)}createHandlerBoundToURL(e){const n=this.getCacheKeyForURL(e);if(!n)throw new f("non-precached-url",{url:e});return s=>(s.request=new Request(e),s.params=Object.assign({cacheKey:n},s.params),this.strategy.handle(s))}}let le;const Ot=()=>(le||(le=new Xr),le);try{self["workbox:routing:7.2.0"]&&_()}catch{}const Nt="GET",q=t=>t&&typeof t=="object"?t:{handle:t};class L{constructor(e,n,s=Nt){this.handler=q(n),this.match=e,this.method=s}setCatchHandler(e){this.catchHandler=q(e)}}class Zr extends L{constructor(e,n,s){const r=({url:i})=>{const o=e.exec(i.href);if(o&&!(i.origin!==location.origin&&o.index!==0))return o.slice(1)};super(r,n,s)}}class ei{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:n}=e,s=this.handleRequest({request:n,event:e});s&&e.respondWith(s)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_URLS"){const{payload:n}=e.data,s=Promise.all(n.urlsToCache.map(r=>{typeof r=="string"&&(r=[r]);const i=new Request(...r);return this.handleRequest({request:i,event:e})}));e.waitUntil(s),e.ports&&e.ports[0]&&s.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:n}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const r=s.origin===location.origin,{params:i,route:o}=this.findMatchingRoute({event:n,request:e,sameOrigin:r,url:s});let c=o&&o.handler;const l=e.method;if(!c&&this._defaultHandlerMap.has(l)&&(c=this._defaultHandlerMap.get(l)),!c)return;let u;try{u=c.handle({url:s,request:e,event:n,params:i})}catch(p){u=Promise.reject(p)}const h=o&&o.catchHandler;return u instanceof Promise&&(this._catchHandler||h)&&(u=u.catch(async p=>{if(h)try{return await h.handle({url:s,request:e,event:n,params:i})}catch(I){I instanceof Error&&(p=I)}if(this._catchHandler)return this._catchHandler.handle({url:s,request:e,event:n});throw p})),u}findMatchingRoute({url:e,sameOrigin:n,request:s,event:r}){const i=this._routes.get(s.method)||[];for(const o of i){let c;const l=o.match({url:e,sameOrigin:n,request:s,event:r});if(l)return c=l,(Array.isArray(c)&&c.length===0||l.constructor===Object&&Object.keys(l).length===0||typeof l=="boolean")&&(c=void 0),{route:o,params:c}}return{}}setDefaultHandler(e,n=Nt){this._defaultHandlerMap.set(n,q(e))}setCatchHandler(e){this._catchHandler=q(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new f("unregister-route-but-not-found-with-method",{method:e.method});const n=this._routes.get(e.method).indexOf(e);if(n>-1)this._routes.get(e.method).splice(n,1);else throw new f("unregister-route-route-not-registered")}}let P;const ti=()=>(P||(P=new ei,P.addFetchListener(),P.addCacheListener()),P);function X(t,e,n){let s;if(typeof t=="string"){const i=new URL(t,location.href),o=({url:c})=>c.href===i.href;s=new L(o,e,n)}else if(t instanceof RegExp)s=new Zr(t,e,n);else if(typeof t=="function")s=new L(t,e,n);else if(t instanceof L)s=t;else throw new f("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});return ti().registerRoute(s),s}function ni(t,e=[]){for(const n of[...t.searchParams.keys()])e.some(s=>s.test(n))&&t.searchParams.delete(n);return t}function*si(t,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:n="index.html",cleanURLs:s=!0,urlManipulation:r}={}){const i=new URL(t,location.href);i.hash="",yield i.href;const o=ni(i,e);if(yield o.href,n&&o.pathname.endsWith("/")){const c=new URL(o.href);c.pathname+=n,yield c.href}if(s){const c=new URL(o.href);c.pathname+=".html",yield c.href}if(r){const c=r({url:i});for(const l of c)yield l.href}}class ri extends L{constructor(e,n){const s=({request:r})=>{const i=e.getURLsToCacheKeys();for(const o of si(r.url,n)){const c=i.get(o);if(c){const l=e.getIntegrityForCacheKey(c);return{cacheKey:c,integrity:l}}}};super(s,e.strategy)}}function ii(t){const e=Ot(),n=new ri(e,t);X(n)}function ai(t){Ot().precache(t)}function oi(t,e){ai(t),ii(e)}function ci(t){kt.add(t)}function Mt(t){t.then(()=>{})}function li(){self.addEventListener("activate",()=>self.clients.claim())}class ui extends Q{async _handle(e,n){let s=await n.cacheMatch(e),r;if(!s)try{s=await n.fetchAndCachePut(e)}catch(i){i instanceof Error&&(r=i)}if(!s)throw new f("no-response",{url:e.url,error:r});return s}}const Pt={cacheWillUpdate:async({response:t})=>t.status===200||t.status===0?t:null};class hi extends Q{constructor(e={}){super(e),this.plugins.some(n=>"cacheWillUpdate"in n)||this.plugins.unshift(Pt),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,n){const s=[],r=[];let i;if(this._networkTimeoutSeconds){const{id:l,promise:u}=this._getTimeoutPromise({request:e,logs:s,handler:n});i=l,r.push(u)}const o=this._getNetworkPromise({timeoutId:i,request:e,logs:s,handler:n});r.push(o);const c=await n.waitUntil((async()=>await n.waitUntil(Promise.race(r))||await o)());if(!c)throw new f("no-response",{url:e.url});return c}_getTimeoutPromise({request:e,logs:n,handler:s}){let r;return{promise:new Promise(o=>{r=setTimeout(async()=>{o(await s.cacheMatch(e))},this._networkTimeoutSeconds*1e3)}),id:r}}async _getNetworkPromise({timeoutId:e,request:n,logs:s,handler:r}){let i,o;try{o=await r.fetchAndCachePut(n)}catch(c){c instanceof Error&&(i=c)}return e&&clearTimeout(e),(i||!o)&&(o=await r.cacheMatch(n)),o}}class di extends Q{constructor(e={}){super(e),this.plugins.some(n=>"cacheWillUpdate"in n)||this.plugins.unshift(Pt)}async _handle(e,n){const s=n.fetchAndCachePut(e).catch(()=>{});n.waitUntil(s);let r=await n.cacheMatch(e),i;if(!r)try{r=await s}catch(o){o instanceof Error&&(i=o)}if(!r)throw new f("no-response",{url:e.url,error:i});return r}}try{self["workbox:expiration:7.2.0"]&&_()}catch{}const fi="workbox-expiration",x="cache-entries",Ge=t=>{const e=new URL(t,location.href);return e.hash="",e.href};class pi{constructor(e){this._db=null,this._cacheName=e}_upgradeDb(e){const n=e.createObjectStore(x,{keyPath:"id"});n.createIndex("cacheName","cacheName",{unique:!1}),n.createIndex("timestamp","timestamp",{unique:!1})}_upgradeDbAndDeleteOldDbs(e){this._upgradeDb(e),this._cacheName&&H(this._cacheName)}async setTimestamp(e,n){e=Ge(e);const s={url:e,timestamp:n,cacheName:this._cacheName,id:this._getId(e)},i=(await this.getDb()).transaction(x,"readwrite",{durability:"relaxed"});await i.store.put(s),await i.done}async getTimestamp(e){const s=await(await this.getDb()).get(x,this._getId(e));return s==null?void 0:s.timestamp}async expireEntries(e,n){const s=await this.getDb();let r=await s.transaction(x).store.index("timestamp").openCursor(null,"prev");const i=[];let o=0;for(;r;){const l=r.value;l.cacheName===this._cacheName&&(e&&l.timestamp<e||n&&o>=n?i.push(r.value):o++),r=await r.continue()}const c=[];for(const l of i)await s.delete(x,l.id),c.push(l.url);return c}_getId(e){return this._cacheName+"|"+Ge(e)}async getDb(){return this._db||(this._db=await $(fi,1,{upgrade:this._upgradeDbAndDeleteOldDbs.bind(this)})),this._db}}class gi{constructor(e,n={}){this._isRunning=!1,this._rerunRequested=!1,this._maxEntries=n.maxEntries,this._maxAgeSeconds=n.maxAgeSeconds,this._matchOptions=n.matchOptions,this._cacheName=e,this._timestampModel=new pi(e)}async expireEntries(){if(this._isRunning){this._rerunRequested=!0;return}this._isRunning=!0;const e=this._maxAgeSeconds?Date.now()-this._maxAgeSeconds*1e3:0,n=await this._timestampModel.expireEntries(e,this._maxEntries),s=await self.caches.open(this._cacheName);for(const r of n)await s.delete(r,this._matchOptions);this._isRunning=!1,this._rerunRequested&&(this._rerunRequested=!1,Mt(this.expireEntries()))}async updateTimestamp(e){await this._timestampModel.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._maxAgeSeconds){const n=await this._timestampModel.getTimestamp(e),s=Date.now()-this._maxAgeSeconds*1e3;return n!==void 0?n<s:!0}else return!1}async delete(){this._rerunRequested=!1,await this._timestampModel.expireEntries(1/0)}}class mi{constructor(e={}){this.cachedResponseWillBeUsed=async({event:n,request:s,cacheName:r,cachedResponse:i})=>{if(!i)return null;const o=this._isResponseDateFresh(i),c=this._getCacheExpiration(r);Mt(c.expireEntries());const l=c.updateTimestamp(s.url);if(n)try{n.waitUntil(l)}catch{}return o?i:null},this.cacheDidUpdate=async({cacheName:n,request:s})=>{const r=this._getCacheExpiration(n);await r.updateTimestamp(s.url),await r.expireEntries()},this._config=e,this._maxAgeSeconds=e.maxAgeSeconds,this._cacheExpirations=new Map,e.purgeOnQuotaError&&ci(()=>this.deleteCacheAndMetadata())}_getCacheExpiration(e){if(e===Y.getRuntimeName())throw new f("expire-custom-caches-only");let n=this._cacheExpirations.get(e);return n||(n=new gi(e,this._config),this._cacheExpirations.set(e,n)),n}_isResponseDateFresh(e){if(!this._maxAgeSeconds)return!0;const n=this._getDateHeaderTimestamp(e);if(n===null)return!0;const s=Date.now();return n>=s-this._maxAgeSeconds*1e3}_getDateHeaderTimestamp(e){if(!e.headers.has("date"))return null;const n=e.headers.get("date"),r=new Date(n).getTime();return isNaN(r)?null:r}async deleteCacheAndMetadata(){for(const[e,n]of this._cacheExpirations)await self.caches.delete(e),await n.delete();this._cacheExpirations=new Map}}const wi={apiKey:"AIzaSyC8tDVbDIrKuylsyF3rbDSSPlzsEHXqZIs",authDomain:"online-attendance-21f95.firebaseapp.com",projectId:"online-attendance-21f95",storageBucket:"online-attendance-21f95.appspot.com",messagingSenderId:"756223518392",appId:"1:756223518392:web:5e8d28c78f7eefb8be764d"};let we;Be().length?we=Be()[0]:we=rt(wi);li();self.clients.claim();const bi=xr(we);X(({request:t})=>t.mode==="navigate",new hi({cacheName:"pages-cache"}));X(({request:t})=>t.destination==="style"||t.destination==="script"||t.destination==="worker",new di({cacheName:"assets-cache"}));X(({request:t})=>t.destination==="image",new ui({cacheName:"images-cache",plugins:[new mi({maxEntries:50,maxAgeSeconds:30*24*60*60})]}));self.addEventListener("fetch",t=>{t.request.mode==="navigate"&&t.respondWith(fetch(t.request).catch(()=>caches.match("/NFC-CAPSTONE-PROJECT/")||caches.match("/NFC-CAPSTONE-PROJECT/index.html")))});self.addEventListener("message",t=>{t.data&&t.data.type==="SKIP_WAITING"&&(a,self.skipWaiting())});self.addEventListener("activate",t=>{t.waitUntil(Promise.all([caches.keys().then(e=>Promise.all(e.map(n=>{if(n.startsWith("workbox-")||n.endsWith("-cache"))return caches.delete(n)}))),clients.claim(),clients.matchAll().then(e=>{e.forEach(n=>n.postMessage({type:"CACHE_UPDATED"}))})]))});oi([{"revision":null,"url":"assets/index-631rhs1U.js"},{"revision":null,"url":"assets/index-BoSwUss-.css"},{"revision":null,"url":"assets/workbox-window.prod.es5-B9K5rw8f.js"},{"revision":"65b5b62533f3aed105270dd8b5f16aed","url":"firebase-messaging-sw.js"},{"revision":"b193d6f9f447e69af8f8e048e299ecd7","url":"index.html"},{"revision":"7be3c6f407b76581cd1dc0910ae60aed","url":"sw.js"},{"revision":"fed9e51e68da48d132326b129199d96b","url":"icons/icon.svg"},{"revision":"771c59a3931ff519a750cf71c6b24578","url":"manifest.webmanifest"}]);Lr(bi,async t=>{var e,n;console.log("Received background message:",t);try{const s={body:t.notification.body,icon:"/NFC-CAPSTONE-PROJECT/icons/icon.svg",badge:"/NFC-CAPSTONE-PROJECT/icons/icon.svg",vibrate:[100,50,100],tag:((e=t.data)==null?void 0:e.messageId)||"default",renotify:!0,requireInteraction:!0,actions:[{action:"view",title:"View Message"}],data:{...t.data,url:`/NFC-CAPSTONE-PROJECT${((n=t.data)==null?void 0:n.url)||""}`,timestamp:Date.now()}};await self.registration.showNotification(t.notification.title,s)}catch(s){console.error("Error showing notification:",s),setTimeout(async()=>{try{await self.registration.showNotification(t.notification.title,notificationOptions)}catch(r){console.error("Retry failed:",r)}},1e3)}});self.addEventListener("notificationclick",t=>{var s;const e=t.notification;t.action;const n=(s=e.data)==null?void 0:s.url;e.close(),t.waitUntil((async()=>{try{const r=await clients.matchAll({type:"window",includeUncontrolled:!0});for(const i of r)if(i.url===n&&"focus"in i){await i.focus();return}n&&await clients.openWindow(n)}catch(r){console.error("Error handling notification click:",r)}})())});
