const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const ejs = require('ejs');

const app = express();
const port = 3000;

// MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'points'
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));


// Render pages using EJS
app.set('view engine', 'ejs');

// First Page: Admin Page
// Update /admin route
app.get('/admin', (req, res) => {
  // Fetch names from the 'names' table
  const sql = 'SELECT * FROM names';
  connection.query(sql, (err, names) => {
    if (err) throw err;

    // Fetch groups from the 'groups' table
    const groupSql = 'SELECT * FROM rht';
    connection.query(groupSql, (err, groups) => {
      if (err) throw err;

      // Pass names and groups to the adminPage.ejs template
      res.render('adminPage', { names, groups });
    });
  });
});
app.get('/success', (req, res) => {
  // Fetch names from the 'names' table
  res.render('success');

});

/// Handle form submission for admin page
app.post('/admin', (req, res) => {
  const password = req.body.password;
  const selectedName = req.body.name;
  const selectedGroup = req.body.group;
  const points = req.body.points;
  const notes = req.body.notes;

  // Validate admin password (hardcoded for simplicity)
  if (password === '123456') {

    console.log(selectedName);
    console.log(points);
    console.log(selectedName == 4);

    if (points > 50 && selectedName == 4) {
      res.render('bisho');
    } else {
      // Insert data into group_points table
      const sql = `INSERT INTO group_points (group_id, points, name_id, notes) VALUES (?, ?, ?, ?)`;
      connection.query(sql, [selectedGroup, points, selectedName, notes], (err, results) => {
        if (err) throw err;
        res.redirect('/success'); // Redirect to success page
      });
    }

  } else {
    res.send('<script>alert("Invalid password"); window.history.back();</script>'); // Display alert and go back
  }
});


// Update /group route
app.get('/group/:groupId', (req, res) => {
  const groupId = req.params.groupId;

  // Fetch group information
  const groupSql = 'SELECT * FROM rht WHERE id = ?';
  connection.query(groupSql, [groupId], (err, group) => {
    if (err) throw err;

    if (!group || group.length === 0) {
      // Handle case where group is not found
      res.send('Group not found');
      return;
    }

    // Fetch points for the specified group
    const pointsSql = `SELECT names.name, group_points.points, group_points.notes
                       FROM names
                       INNER JOIN group_points ON names.id = group_points.name_id
                       WHERE group_points.group_id = ?`;
    connection.query(pointsSql, [groupId], (err, points) => {
      if (err) throw err;

      // Calculate total group points
      const totalPoints = points.reduce((acc, row) => acc + row.points, 0);

      // Render the groupPage.ejs template with group information and points
      res.render('groupPage', { group: group[0], points, totalPoints });
    });
  });
});


app.get('/groups', (req, res) => {
  const sql = `SELECT rht.id AS group_id, rht.name AS group_name, 
                      SUM(group_points.points) AS totalPoints
              FROM group_points
               INNER JOIN names ON group_points.name_id = names.id
               INNER JOIN rht ON group_points.group_id = rht.id
              GROUP BY rht.id, rht.name
              ORDER BY totalPoints DESC`;

  connection.query(sql, (err, groups) => {
    if (err) throw err;

    // Now, get detailed information for each group
    const groupPromises = groups.map(group => {
      return new Promise((resolve, reject) => {
        const groupDetailsSQL = `SELECT names.name, group_points.points, group_points.notes 
                                 FROM group_points
                                 INNER JOIN names ON group_points.name_id = names.id
                                 WHERE group_points.group_id = ?`;

        connection.query(groupDetailsSQL, [group.group_id], (err, groupPoints) => {
          if (err) {
            reject(err);
          } else {
            group.points = groupPoints;
            resolve(group);
          }
        });
      });
    });

    Promise.all(groupPromises)
      .then(groupsWithDetails => {
        res.render('allPointsPage', { groups: groupsWithDetails });
      })
      .catch(error => {
        throw error;
      });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
