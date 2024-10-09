const axios = require('axios');
const argv = require('yargs').argv;

const shopName = 'https://anatta-test-store.myshopify.com';
const adminKey = process.env.ADMIN_ACCESS_TOKEN;

const graphqlUrl = `${shopName}/admin/api/2024-10/graphql.json`;

const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': adminKey,
}

const fetchProducts = async (name) => {
    const query = `
        query ($name: String!, $productLimit: Int!, $variantLimit: Int!) {
            products(first: $productLimit, query: $name) {
                edges {
                    node {
                        title
                        variants(first: $variantLimit) {
                            edges {
                                node {
                                    title
                                    price
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const variables = {
        name,
        productLimit: 10,
        variantLimit: 10
    }

    const graphqlQuery = { query, variables };

    try {
        const response = await axios.post(graphqlUrl, graphqlQuery, { headers });
        const products = response.data.data.products.edges;

        products.forEach((product) => {
            const productName = product.node.title;
            const variants = product.node.variants.edges;

            variants.sort((a, b) => a.node.price - b.node.price);

            variants.forEach((variant) => {
                console.log(`${productName} - ${variant.node.title} - price $${variant.node.price}`);
            });
        });
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    if (argv.name) {
        await fetchProducts(argv.name);
    } else {
        console.log('Please provide a product name using the --name flag.');
    }
})();
