const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express();

const authors = [
	{ id: 1, name: 'Octavia Butler' },
	{ id: 2, name: 'Franz Kafka' },
	{ id: 3, name: 'Ted Chiang' }
]

const books = [
	{ id: 1, name: 'Liliths Brood', authorId: 1 },
	{ id: 2, name: 'The Metamorphosis', authorId: 1 },
	{ id: 3, name: 'Kindres', authorId: 1 },
	{ id: 4, name: 'The Castle', authorId: 2 },
	{ id: 5, name: 'Parable of the Sower', authorId: 2 },
	{ id: 6, name: 'The Trial', authorId: 2 },
	{ id: 7, name: 'Exhalation', authorId: 3 },
	{ id: 8, name: 'Blues People', authorId: 3 }
]

const AuthorType = new GraphQLObjectType ({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: { 
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType ({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

/*
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Hello_World',
        fields: () => ({
            message: {
                type: GraphQLString,
                resolve: () => 'Hello World'
            }
        })
    })
})
*/

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            decription: 'Single Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            decription: 'List of All Books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            decription: 'Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            decription: 'List of All Authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = { 
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId 
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = { 
                    id: authors.length + 1,
                    name: args.name,
                }
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema ({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000., () => console.log('Server Running'));