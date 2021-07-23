const { default: axios } = require("axios");
const graphql = require("graphql");

const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const AddressType = new GraphQLObjectType({
    name: "Address",
    fields: () => ({
        id: {type: GraphQLString},
        city: {type: GraphQLString},
        zipcode: {type: GraphQLInt},
        users: {
            type: new GraphQLList(UserType),
            async resolve(parentValue, args) {
                return await axios.get(`http://localhost:3000/address/${parentValue.id}/users`)
                .then(res => res.data);
            } 
        }
    })
});

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLString},
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt},
        address: {
            type: AddressType,
            async resolve(parentValue, args){
                return await axios.get(`http://localhost:3000/address/${parentValue.addressId}`)
                .then(res => res.data)
            }
        }
    }),
});

const rootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString }},
            async resolve(parentValue, args) {
                return await axios.get(`http://localhost:3000/users/${args.id}`)
                .then(res => res.data);
            }
        },
        address: {
            type: AddressType,
            args: { id: { type: GraphQLString }},
            async resolve(parentValue, args) {
                console.log(args)
                return await axios.get(`http://localhost:3000/address/${args.id}`)
                .then(res => res.data);
            }
        }
    }
});

// ------------------ Mutations ------------------

const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLNonNull(GraphQLInt) },
                addressId: { type: GraphQLString },
            },
            async resolve(parentValue, {firstName, age}) {
                return await axios.post('http://localhost:3000/users', { firstName, age })
                .then(res => res.data)
            }
        },
        deleteUserById: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parentValue, {id}) {
                return await axios.delete(`http://localhost:3000/users/${id}`)
                .then(res => res.data)
            }
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLInt },
                addressId: { type: GraphQLString },
                firstName: { type: GraphQLString },
            },
            async resolve(parentValue, args) {
                console.log(args);
                return await axios.patch(`http://localhost:3000/users/${args.id}`)
                .then(res => res.data)
            }
        }
    })
})

module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation
});

