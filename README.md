# README #

This README would normally document whatever steps are necessary to get your application up and running.


### How do I get set up? ###

*run node qiosk.js
*refer app.js for all the routes available
*initial modules with thr routes are 

app.use('/user',userRouter);
app.use('/article',articleRouter);
app.use('/collection',collectionRouter);
app.use('/likes',likesRouter);
app.use('/notes',notesRouter);
app.use('/follow',followRouter);
app.use('/share',shareRouter);
app.use('/search',searchRouter);

* run http://localhost:7777/search/test for testing each module

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact