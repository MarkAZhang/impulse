self.onmessage=function(c){var b=c.data.a,m=c.data.b,l=c.data.c,k=c.data.d;c=c.data.e;for(var q=[],n=[],u=[],t={},v={},C={},e=0;e<b.length;e++)for(var h=b[e],d=h.length-1,f=0;f<h.length;f++){for(var g=h[f],r=!1,a=0;a<b.length;a++)e!=a&&x(b[a],g)&&(r=!0);g.p_n=e;g.p_v=h.length;g.p_i=f;if(a=!r)a=l?l:1,a=0<=g.x&&0<=g.y&&g.x<=k/a-0&&g.y<=c/a-0;a&&n.push(g);q.push({p1:h[f],p2:h[d]});d=f}postMessage({z:0.25});for(e=0;e<n.length;e++)for(t[e]={},f=0;f<e;f++)a=n[e],d=n[f],a.p_n!=d.p_n||a.p_n==d.p_n&&(1==Math.max(a.p_i,
d.p_i)-Math.min(a.p_i,d.p_i)||0==Math.min(a.p_i,d.p_i)&&Math.max(a.p_i,d.p_i)==a.p_v-1)?z(a,d,q)&&z(a,d,m)&&(u.push({p1:a,p2:d}),a=A(d,a),t[e][f]=a,t[f][e]=a):a.p_n==d.p_n&&!x(b[a.p_n],{x:(a.x+d.x)/2,y:(a.y+d.y)/2})&&z(a,d,m)&&z(a,d,q)&&(u.push({p1:a,p2:d}),a=A(d,a),t[e][f]=a,t[f][e]=a);postMessage({z:0.5});for(d=0;d<n.length;d++){e=t;h=d;f={};a={};a[h]=0;b=B.k();b.push(h,0);for(var p=r=g=h=g=void 0,y=p=void 0,w=void 0;b;){g=b.pop();if(!g)break;var h=g.value,g=g.g,r=e[h]||{},s;for(s in r){p=r[s];
p=g+p;y=a[s];if((w="undefined"===typeof a[s])||y>p)a[s]=p,b.push(s,p),f[s]=h;if(void 0===s){b=null;break}}}b=f;v[d]={};for(e=0;e<d;e++){f=b;a=[];for(h=e;void 0!=h;)a.push(h),h=f[h];a.reverse();h=a;if(1==h.length)v[d][e]={a:null,b:null},v[e][d]={a:null,b:null};else{g=0;f=h[0];for(a=1;a<h.length;a++)g+=t[f][h[a]],f=h[a];v[d][e]={a:h,b:g};v[e][d]={a:h.slice(0).reverse(),b:g}}}}postMessage({z:0.75});s={};for(e=-150;e<k+150;e+=50)for(f=-150;f<c+150;f+=50){b=[];h=[{x:e/l,y:f/l},{x:e/l,y:(f+50)/l},{x:(e+
50)/l,y:f/l},{x:(e+50)/l,y:(f+50)/l}];for(a=0;a<h.length;a++){d=h[a];g=n;r=m;p=s;if(p.hasOwnProperty(d.x+" "+d.y))g=p[d.x+" "+d.y];else{y=[];for(w=0;w<g.length;w++)z(d,g[w],r)&&y.push(w);g=p[d.x+" "+d.y]=y}for(r=0;r<g.length;r++){p=!0;for(d=0;d<b.length;d++)if(b[d]==g[r]){p=!1;break}p&&b.push(g[r])}}C[e+" "+f]=b}postMessage({a:q,b:n,c:u,d:t,e:v,f:C})};
function z(c,b,m){for(var l=0;l<m.length;l++){var k;if(k=!(D(c,m[l].p1)||D(c,m[l].p2)||D(b,m[l].p1)||D(b,m[l].p2))){var q=m[l].p1,n=m[l].p2;k={x:b.x-c.x,y:b.y-c.y};var n={x:n.x-q.x,y:n.y-q.y},q={x:q.x-c.x,y:q.y-c.y},u=E(k,n);0==u&&0==E(q,n)?k=!1:(n=E(q,n)/u,k=E(q,k)/u,k=0<=n&&1>=n&&0<=k&&1>=k)}if(k)return!1}return!0}
function x(c,b){for(var m=c.length-1,l=!1,k=0;k<c.length;k++)(c[k].y<b.y&&c[m].y>=b.y||c[k].y>=b.y&&c[m].y<b.y)&&c[k].y!=c[m].y&&c[k].x+(b.y-c[k].y)/(c[m].y-c[k].y)*(c[m].x-c[k].x)<b.x&&(l=!l),m=k;return l}function A(c,b){return Math.sqrt(Math.pow(c.x-b.x,2)+Math.pow(c.y-b.y,2))}function D(c,b){return c.x==b.x&&c.y==b.y}function E(c,b){return c.x*b.y-c.y*b.x}
var B={k:function(c){var b={};c=c||{};for(var m in B)b[m]=B[m];b.h=[];b.i=c.i||B.j;return b},j:function(c,b){return c.g-b.g},push:function(c,b){this.h.push({value:c,g:b});this.h.sort(this.i)},pop:function(){return this.h.shift()}};