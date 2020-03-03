loginByThirdparty: function (info, done) {
  models.user.findOne({
    where: { idUser: info.auth_email }
  })
    .then(result => {
      // console.log(result);
      if (result) {
        return done(null, result);
      } else if (!result) {
        models.user.create({
          idUser: info.auth_email,
          name: info.auth_name
        })
          .then(result2 => {
            return done(null, result2);
          })
      }
    })
}

