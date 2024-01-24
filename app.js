const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const ejs = require('ejs');

const app = express();
const port = 3000;

const POSTGRES_USER="postgres.miptgpgnfbpsrunkccea"
const POSTGRES_HOST="aws-0-ap-south-1.pooler.supabase.com"
const POSTGRES_PASSWORD="Root@Rr147896325"
const POSTGRES_DATABASE="postgres"

// PostgreSQL connection
const client = new Client({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  port: 6543,

});
client.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Render pages using EJS
app.set('view engine', 'ejs');

// First Page: Admin Page
app.get('/admin', (req, res) => {
  // Fetch names from the 'names' table
  const namesSql = 'SELECT * FROM names';
  client.query(namesSql, (err, namesResult) => {
    if (err) throw err;

    // Fetch groups from the 'rht' table
    const groupsSql = 'SELECT * FROM rht';
    client.query(groupsSql, (err, groupsResult) => {
      if (err) throw err;

      // Pass names and groups to the adminPage.ejs template
      res.render('adminPage', { names: namesResult.rows, groups: groupsResult.rows });
    });
  });
});

app.get('/success', (req, res) => {
  res.render('success');
});

// Handle form submission for admin page
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
      const sql = `INSERT INTO group_points (group_id, points, name_id, notes) VALUES ($1, $2, $3, $4)`;
      client.query(sql, [selectedGroup, points, selectedName, notes], (err, results) => {
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
  const groupSql = 'SELECT * FROM rht WHERE id = $1';
  client.query(groupSql, [groupId], (err, groupResult) => {
    if (err) throw err;

    const group = groupResult.rows[0];

    if (!group) {
      // Handle case where group is not found
      res.send('Group not found');
      return;
    }

    // Fetch points for the specified group
    const pointsSql = `SELECT names.name, group_points.points, group_points.notes
                       FROM names
                       INNER JOIN group_points ON names.id = group_points.name_id
                       WHERE group_points.group_id = $1`;
    client.query(pointsSql, [groupId], (err, pointsResult) => {
      if (err) throw err;

      const points = pointsResult.rows;

      // Calculate total group points
      const totalPoints = points.reduce((acc, row) => acc + row.points, 0);

      // Render the groupPage.ejs template with group information and points
      res.render('groupPage', { group, points, totalPoints });
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

  client.query(sql, (err, groupsResult) => {
    if (err) throw err;

    const groups = groupsResult.rows;

    // Now, get detailed information for each group
    const groupPromises = groups.map(group => {
      return new Promise((resolve, reject) => {
        const groupDetailsSQL = `SELECT names.name, group_points.points, group_points.notes 
                                 FROM group_points
                                 INNER JOIN names ON group_points.name_id = names.id
                                 WHERE group_points.group_id = $1`;

        client.query(groupDetailsSQL, [group.group_id], (err, groupPointsResult) => {
          if (err) {
            reject(err);
          } else {
            group.points = groupPointsResult.rows;
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
