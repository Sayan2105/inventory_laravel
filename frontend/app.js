const API = "http://127.0.0.1:8000/api";

function authHeaders(){
  return {
    "Content-Type":"application/json",
    "Accept":"application/json",
    "Authorization":"Bearer "+localStorage.token
  }
}

async function login(){
  let r = await fetch(API+"/login",{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({
      email:email.value,
      password:password.value
    })
  });

  let d = await r.json();

  if(d.token){
    localStorage.token = d.token;
    window.location="dashboard.html";
  }else{
    msg.innerText="Invalid credentials";
  }
}

function logout(){
  localStorage.removeItem("token");
  window.location="index.html";
}

async function loadProducts(){
  let r = await fetch(API+"/products",{ headers:authHeaders() });
  let data = await r.json();

  let html = `
  <div class="flex justify-between mb-4">
    <h2 class="text-xl font-semibold">Products</h2>
    <button onclick="showAddProduct()" class="bg-green-600 text-white px-4 py-2 rounded">Add</button>
  </div>

  <table class="w-full bg-white shadow rounded">
  <thead class="bg-gray-200">
  <tr>
    <th class="p-2">ID</th>
    <th>Name</th>
    <th>SKU</th>
    <th>Stock</th>
    <th>Action</th>
  </tr>
  </thead>
  <tbody>
  `;

  data.forEach(p=>{
    html+=`
      <tr class="border-t">
        <td class="p-2">${p.id}</td>
        <td>${p.name}</td>
        <td>${p.sku}</td>
        <td>${p.quantity}</td>
        <td>
          <button onclick="showMove(${p.id})"
          class="bg-blue-500 text-white px-2 py-1 rounded text-sm">
          Move
          </button>
        </td>
      </tr>
    `;
  });

  html+="</tbody></table>";

  content.innerHTML=html;
}

function showMove(id){
  content.innerHTML=`
    <h2 class="text-xl font-semibold mb-4">Stock Movement</h2>
    <input id="pid" type="hidden" value="${id}">
    <input id="qty" placeholder="Quantity" class="border p-2 mb-2 w-full rounded">
    <select id="type" class="border p-2 mb-4 w-full rounded">
      <option value="in">IN</option>
      <option value="out">OUT</option>
    </select>
    <button onclick="moveStock()"
    class="bg-green-600 text-white px-4 py-2 rounded">
    Submit
    </button>
    <p id="res" class="mt-4 text-green-600"></p>
  `;
}

async function moveStock(){
  let r = await fetch(API+"/stock/move",{
    method:"POST",
    headers:authHeaders(),
    body:JSON.stringify({
      product_id:pid.value,
      quantity:qty.value,
      type:type.value
    })
  });

  let d = await r.json();

  if(d.message){
    res.innerText = d.message+" | Current Stock: "+d.current_stock;
  }else{
    res.innerText="Error";
  }
}

async function loadMovements(){
  let r = await fetch(API+"/movements",{ headers:authHeaders() });
  let data = await r.json();

  let html="<h2 class='text-xl font-semibold mb-4'>Movements</h2>";
  html+="<table class='w-full bg-white shadow rounded'><tbody>";

  data.forEach(m=>{
    html+=`
    <tr class="border-t">
      <td class="p-2">${m.product.name}</td>
      <td>${m.type}</td>
      <td>${m.quantity}</td>
      <td>${m.user.name}</td>
    </tr>
    `;
  });

  html+="</tbody></table>";

  content.innerHTML=html;
}
