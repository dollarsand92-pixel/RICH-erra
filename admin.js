const form =
document.getElementById("productForm")
const adminProducts =
document.getElementById("adminProducts")

form.addEventListener("submit", function
    (e) {
        e.preventDefault();
        const name =
        document.getElementById("name").value;
        const price =
        Number(document.getElementById("price").value);
        const stock =
        Number(document.getElementById("stock").value);
        const imageFile =
        document.getElementById("image").files[0];
        const reader = new FileReader();

        reader.onload = function () {
            const newProduct = {
                id: Date.now(),
                name,
                price,
                stock,
                image: reader.result //base64 image
            };

            products.push(newProduct);
            saveProducts();
            renderAdmin();
            form.reset();
        };

        reader.readAsDataURL(imageFile);
    });

    function renderAdmin() {
         adminProducts.innerHTML = "";

        products.forEach((p, index) => {
            adminProducts.innerHTML += `
            <div style="margin-bottom:20px">
            <img src="${p.image}" width="80">
            <input value="${p.name}"

            onchange="updateName(${index},
            this.value)">
            <input type="number" value="${p.price}"

            onchange="updatePrice(${index},
            this.value)">
            <input type="number" value="${p.stock}"

            onchange="updateStock(${index},
            this.value)">
            <button onclick="deleteProduct($
            {index})">❌</button>
            </div>
            `;
        });
    }

    function updateName(i, v) {
        products[i].name = v;
        saveProducts();
    }

    function updatePrice(i, v) {
        products[i].price = Number(v);
        saveProducts();
    }

    function updateStock(i, v) {
        products[i].stock = Number(v);
        saveProducts();
    }

    function deleteProduct(i) {
        products.splice(i, 1);
        saveProducts();
        renderAdmin();
    }

    renderAdmin();

